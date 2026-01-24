import argparse
import time
from solana.rpc.api import Client
from solders.pubkey import Pubkey
from solders.signature import Signature

# Constants
MEVX_FEE_WALLET = Pubkey.from_string("3kxSQybWEeQZsMuNWMRJH4TxrhwoDwfv41TNMLRzFP5A")
DEFAULT_RPC = "https://fragrant-cold-season.solana-mainnet.quiknode.pro/0b54233a57631b23c8e3d36e156b109aa5f94343/"

def find_signer(token_mint_str, target_amount, tolerance=0.1, rpc_url=DEFAULT_RPC, max_search=2000):
    print(f"Connecting to RPC: {rpc_url}")
    client = Client(rpc_url)
    
    try:
        mint_pubkey = Pubkey.from_string(token_mint_str)
    except Exception as e:
        print(f"Error parsing token mint: {e}")
        return

    print(f"Search Target: {target_amount} SOL (+/- {tolerance})")
    print(f"Token Mint: {token_mint_str}")
    
    before_sig = None
    total_checked = 0
    fetching = True

    while fetching and total_checked < max_search:
        limit = 100 # Fetch 100 at a time
        print(f"Fetching {limit} signatures (Total checked: {total_checked})...")
        try:
            resp = client.get_signatures_for_address(mint_pubkey, limit=limit, before=before_sig)
            signatures = resp.value
            
            if not signatures:
                print("No more signatures found.")
                break
                
            before_sig = signatures[-1].signature # Update cursor for next batch
            
        except Exception as e:
            print(f"Error fetching signatures: {e}")
            break

        print(f"Analyzing {len(signatures)} transactions...")

        for sig_info in signatures:
            sig = sig_info.signature
            total_checked += 1
            
            try:
                # Fetch full transaction details
                tx_resp = client.get_transaction(sig, max_supported_transaction_version=0)
                
                if not tx_resp.value:
                    continue
                    
                tx_meta = tx_resp.value.transaction.meta
                tx_obj = tx_resp.value.transaction.transaction
                message = tx_obj.message
                
                # Check for MevX Fee Wallet
                # 1. Check Static Keys
                static_keys = message.account_keys
                found_mevx = False
                
                # Quick string check on account keys
                # We iterate to find if any key == MEVX_FEE_WALLET
                if MEVX_FEE_WALLET in static_keys:
                    found_mevx = True
                
                # 2. Check Loaded Addresses (if V0)
                if not found_mevx and tx_meta.loaded_addresses:
                   if MEVX_FEE_WALLET in tx_meta.loaded_addresses.writable:
                       found_mevx = True
                   elif MEVX_FEE_WALLET in tx_meta.loaded_addresses.readonly:
                       found_mevx = True
                       
                if not found_mevx:
                    continue

                # Identify the signer (Fee payer is index 0 of static keys)
                signer = static_keys[0]
                
                # Calculate SOL balance change for the signer
                pre_bal = tx_meta.pre_balances[0]
                post_bal = tx_meta.post_balances[0]
                
                diff_sol = (pre_bal - post_bal) / 1e9
                
                # print(f"  [Scan] Tx: {sig} | Signer: {signer} | Diff: {diff_sol:.4f}")
                
                if abs(diff_sol - target_amount) <= tolerance:
                    print("\n" + "="*50)
                    print("MATCH FOUND!")
                    print(f"Transaction: https://solscan.io/tx/{sig}")
                    print(f"Signer: {signer}")
                    print(f"SOL Amount Change: {diff_sol:.6f}")
                    print("="*50 + "\n")
                    # We continue searching in case there are multiple matches? 
                    # For now let's just return to satisfy the user quickly.
                    return 
                    
            except Exception as e:
                # print(f"Error processing {sig}: {e}")
                continue
    
    print(f"Search complete. Checked {total_checked} transactions. No match found.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Find a signer interacting with MevX for a specific SOL swap amount.")
    parser.add_argument("--token", required=True, help="Token Mint Address")
    parser.add_argument("--amount", required=True, type=float, help="Amount of SOL swaped (approx)")
    parser.add_argument("--tolerance", type=float, default=0.1, help="Tolerance for SOL amount matching (default 0.1)")
    parser.add_argument("--limit", type=int, default=2000, help="Max transactions to search")
    
    args = parser.parse_args()
    
    find_signer(args.token, args.amount, args.tolerance, max_search=args.limit)
