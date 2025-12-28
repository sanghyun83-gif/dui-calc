import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinCalc | Free 1099 Self-Employment Tax Calculator 2025",
  description: "Calculate your 2025 self-employment taxes instantly. Free 1099 tax calculator for US freelancers with accurate IRS rates. SE tax, federal tax, and quarterly payments.",
  keywords: ["1099 tax calculator", "self employment tax calculator", "freelance tax calculator", "quarterly tax estimator", "SE tax 2025"],
  openGraph: {
    title: "Free 1099 Tax Calculator 2025 | FinCalc",
    description: "Calculate SE tax, federal tax, and quarterly payments for freelancers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
