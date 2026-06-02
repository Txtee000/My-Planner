import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planner",
  description: "Personal planner app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body className="my-6 mx-8 bg-(--color1)">{children}</body>
    </html>
  );
}
