import { Navbar } from "@/feature/components/navbar";

export default function RootLayout({
    children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
        <Navbar />
        <div className="ml-60">{children}</div>
    </div>
  );
}