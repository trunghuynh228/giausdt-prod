from solana.rpc.api import Client
from solders.pubkey import Pubkey
from solders.signature import Signature

# Constants
TX_SIG = "3Ux6hSqQumpgh9t9qcozpbYtM99XFhzPTYX8hXvNdf5uAxk5DrWkssfvnVp2qGciYFudwRm7dup4dZqFHdqYmmv7"
MEVX_FEE_WALLET = "3kxSQybWEeQZsMuNWMRJH4TxrhwoDwfv41TNMLRzFP5A"
DEFAULT_RPC = "https://fragrant-cold-season.solana-mainnet.quiknode.pro/0b54233a57631b23c8e3d36e156b109aa5f94343/"

client = Client(DEFAULT_RPC)

print(f"Fetching properties for {TX_SIG}...")
sig = Signature.from_string(TX_SIG)
resp = client.get_transaction(sig, max_supported_transaction_version=0)

if not resp.value:
    print("Transaction not found!")
    exit()

tx = resp.value.transaction.transaction
meta = resp.value.transaction.meta
msg = tx.message

print("--- Balances ---")
pre_bal = meta.pre_balances[0]
post_bal = meta.post_balances[0]
diff = (pre_bal - post_bal) / 1e9

print(f"Signer Pre Balance: {pre_bal / 1e9}")
print(f"Signer Post Balance: {post_bal / 1e9}")
print(f"Diff: {diff:.9f} SOL")

# Check Token Balances if native SOL diff is small
print("\n--- Token Balance Changes ---")
# Only basic check - printing all pre/post token balances might be verbose, but let's see account 0's related ones.
# Or just scan what changed.
