export const AboutSection = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-muted/30 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* About */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-3">Về giausdt.vn</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nền tảng theo dõi giá USDT/VND hàng đầu Việt Nam. Cập nhật tỷ giá USDT theo thời gian thực từ các sàn uy tín như Holdstation Pay, Binance P2P, Onramp Money.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-3">Liên kết nhanh</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://pay.holdstation.com/ref/9TCFHc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Mua USDT - Holdstation Pay
                </a>
              </li>
              <li>
                <a
                  href="https://p2p.binance.com/en/trade/buy/USDT/?fiat=VND"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Binance P2P
                </a>
              </li>
              <li>
                <a
                  href="https://onramp.money"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Onramp Money
                </a>
              </li>
              <li>
                <a
                  href="https://alchemypay.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  AlchemyPay
                </a>
              </li>
              <li>
                <a
                  href="https://www.bybit.com/vi-VN/fiat/trade/express/home/buy/USDT/VND"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Bybit P2P
                </a>
              </li>
              <li>
                <a
                  href="https://www.moonpay.com/buy/usdt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  MoonPay
                </a>
              </li>
            </ul>
          </div>

          {/* Keywords for SEO */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-3">Từ khóa phổ biến</h4>
            <div className="flex flex-wrap gap-1.5">
              {['Giá USDT', 'USDT VND', 'Tỷ giá USDT', 'Mua USDT', 'Bán USDT'].map((keyword) => (
                <span
                  key={keyword}
                  className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {currentYear} giausdt.vn - Theo dõi giá USDT/VND theo thời gian thực.
          </p>
        </div>
      </div>
    </footer>
  );
};
