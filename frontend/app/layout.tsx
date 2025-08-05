import '@/styles/app.css';

export const metadata = {
  title: "Bloomia - 学びが花開く場所",
  description: "未来の教育を Bloomia で。統合型LMSで学びをもっと楽しく、継続しやすく。",
  keywords: "教育, LMS, 学習管理システム, オンライン学習",
  authors: [{ name: "Bloomia Inc." }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-background text-foreground m-0 p-0">
        {children}
      </body>
    </html>
  );
}