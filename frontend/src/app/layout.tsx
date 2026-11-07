import type { Metadata } from "next";
import "./globals.css";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { CurrencyConverterModal } from "@/components/currency/CurrencyConverterModal";

export const metadata: Metadata = {
  title: "Retail Insights | Enterprise Analytics Platform",
  description:
    "Production-ready Retail Analytics and Business Intelligence web application powered by Next.js and Python FastAPI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
        <CurrencyProvider>
          {children}
          <CurrencyConverterModal />
        </CurrencyProvider>
      </body>
    </html>
  );
}
