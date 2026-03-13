import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Launch Hub - ローンチナビゲーター',
  description: 'ローンチに必要な全ツールへのアクセスと進行管理',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
