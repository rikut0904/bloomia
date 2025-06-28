export const metadata = {
  title: "Bloomia",
  description: "学びが花開く場所",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head />
      <body className="app-main">{children}</body>
    </html>
  );
}