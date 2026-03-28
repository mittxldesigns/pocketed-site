import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Pocketed — Companies Owe You Money. We Get It Back.",
  description:
    "Pocketed scans your email for purchases, finds price drops, missed returns, forgotten subscriptions, and expiring warranties — then recovers the cash automatically.",
  openGraph: {
    title: "Pocketed — Companies Owe You Money. We Get It Back.",
    description:
      "Pocketed scans your email for purchases, finds price drops, missed returns, forgotten subscriptions, and expiring warranties — then recovers the cash automatically.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
