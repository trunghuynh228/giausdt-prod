import { useState, useMemo, useEffect } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { ExchangeRate } from '@/types/rates';
import { Skeleton } from '@/components/ui/skeleton';

interface UsdtCalculatorProps {
  rate?: ExchangeRate;
  isLoading: boolean;
}

export function UsdtCalculator({ rate, isLoading }: UsdtCalculatorProps) {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [rawInput, setRawInput] = useState<string>('');

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value));
  };

  const formatInputDisplay = (raw: string, isVND: boolean) => {
    if (!raw) return '';
    if (isVND) {
      // Format with thousand separators for VND
      const num = parseFloat(raw);
      if (isNaN(num)) return raw;
      return new Intl.NumberFormat('en-US').format(Math.round(num));
    }
    return raw;
  };

  // Set default input based on mode and rate
  useEffect(() => {
    if (mode === 'buy' && rate?.sell) {
      // In buy mode, default VND = rate so output = 1 USDT
      setRawInput(String(Math.round(rate.sell)));
    } else if (mode === 'sell') {
      setRawInput('1');
    }
  }, [mode, rate?.sell]);

  const result = useMemo(() => {
    const amount = parseFloat(rawInput) || 0;

    if (mode === 'buy') {
      // Buy mode: input is VND, output is USDT
      const currentRate = rate?.sell; // API: sell = user buys
      if (!currentRate) return 0;
      return amount / currentRate;
    } else {
      // Sell mode: input is USDT, output is VND
      const currentRate = rate?.buy; // API: buy = user sells
      if (!currentRate) return 0;
      return amount * currentRate;
    }
  }, [rawInput, mode, rate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove commas and non-numeric characters except dot
    let value = e.target.value.replace(/,/g, '').replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    // Limit decimals to 6 for USDT (sell mode)
    if (mode === 'sell' && parts.length === 2 && parts[1].length > 6) {
      value = parts[0] + '.' + parts[1].slice(0, 6);
    }
    setRawInput(value);
  };

  const handleModeChange = (newMode: 'buy' | 'sell') => {
    setMode(newMode);
  };

  const currentRate = mode === 'buy' ? rate?.sell : rate?.buy;

  // Format result based on mode
  const formatUSDT = (value: number) => {
    // Max 2 decimals for buy mode, remove trailing zeros
    const formatted = value.toFixed(2);
    return parseFloat(formatted).toString();
  };

  const formattedResult = mode === 'buy'
    ? formatUSDT(result) // USDT with up to 2 decimals, no trailing zeros
    : formatVND(result); // VND rounded

  const inputCurrency = mode === 'buy' ? 'VND' : 'USDT';
  const outputCurrency = mode === 'buy' ? 'USDT' : 'VND';
  const displayInput = formatInputDisplay(rawInput, mode === 'buy');

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white border border-border shadow-xl overflow-hidden">
        <div className="flex border-b border-border">
          <Skeleton className="flex-1 h-14" />
          <Skeleton className="flex-1 h-14" />
        </div>
        <div className="p-6 space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-10 mx-auto rounded-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-border shadow-xl overflow-hidden">
      {/* Buy/Sell Toggle - Tab style matching reference */}
      <div className="flex border-b border-border">
        <button
          onClick={() => handleModeChange('buy')}
          className={`flex-1 py-4 text-sm font-bold text-center transition-colors ${mode === 'buy'
            ? 'bg-primary text-white'
            : 'bg-gray-50 text-muted-foreground hover:text-foreground'
            }`}
        >
          Mua (VND → USDT)
        </button>
        <button
          onClick={() => handleModeChange('sell')}
          className={`flex-1 py-4 text-sm font-bold text-center transition-colors ${mode === 'sell'
            ? 'bg-red-500 text-white'
            : 'bg-gray-50 text-muted-foreground hover:text-foreground'
            }`}
        >
          Bán (USDT → VND)
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* YOU PAY */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Bạn trả
          </label>
          <div className="relative group">
            <input
              type="text"
              value={displayInput}
              onChange={handleInputChange}
              placeholder="0"
              className="block w-full rounded-xl border-2 border-border bg-white py-4 pl-4 pr-16 text-lg font-bold text-foreground placeholder-gray-400 focus:border-primary focus:ring-0 focus:outline-none transition-colors shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <span className="font-bold text-muted-foreground">{inputCurrency}</span>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-3 relative z-10">
          <button className="rounded-full bg-white p-2 text-primary border border-border hover:bg-gray-50 hover:scale-110 transition-all shadow-sm">
            <ArrowUpDown className="h-5 w-5" />
          </button>
        </div>

        {/* YOU RECEIVE */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Bạn nhận
          </label>
          <div className="relative">
            <input
              type="text"
              value={formattedResult}
              readOnly
              placeholder="0"
              className="block w-full rounded-xl border-2 border-border bg-gray-50 py-4 pl-4 pr-20 text-lg font-bold text-foreground placeholder-gray-400 focus:border-primary focus:ring-0 transition-colors"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <span className="font-bold text-muted-foreground">{outputCurrency}</span>
            </div>
          </div>
        </div>

        {/* Rate Box */}
        <div className="rounded-lg bg-gray-50 p-4 border border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tỷ giá</span>
            <span className="font-bold text-foreground">
              1 USDT ≈ {currentRate ? formatVND(currentRate) : '--'} VND
            </span>
          </div>
        </div>

        {/* Action Button */}
        {mode === 'buy' ? (
          <a
            href="https://pay.holdstation.com/ref/9TCFHc"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 text-center text-white font-bold rounded-xl bg-green-500 hover:bg-green-600 transition-colors"
          >
            Mua
          </a>
        ) : (
          <a
            href="https://pay.holdstation.com/ref/9TCFHcsell&chain_id=56&token_address=0x55d398326f99059ff775485246999027b3197955&currency=usd"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 text-center text-white font-bold rounded-xl bg-red-500 hover:bg-red-600 transition-colors"
          >
            Bán
          </a>
        )}
      </div>
    </div>
  );
}