
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RentForge | Equipment Rental Marketplace",
  description:
    "Find, compare and rent quality equipment for every project with RentForge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

