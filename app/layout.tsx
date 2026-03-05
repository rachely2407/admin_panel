import "./globals.css";

export const metadata = {
  title: "Humor Project Admin",
  description: "Cute + future admin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}