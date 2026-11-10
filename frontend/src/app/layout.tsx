import type { Metadata } from "next";
import "./globals.css";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { CurrencyConverterModal } from "@/components/currency/CurrencyConverterModal";

export const metadata: Metadata = {
  metadataBase: new URL("https://frontend-m5va.vercel.app"),
  title: {
    default: "Retail Insights | Enterprise Analytics Platform",
    template: "%s | Retail Insights",
  },
  description:
    "Executive retail intelligence platform with automated revenue trends, RFM customer segmentation, catalog margin analytics, and prescriptive recommendations.",
  applicationName: "Retail Insights BI",
  keywords: ["Retail Analytics", "Business Intelligence", "Sales Velocity", "RFM Segmentation", "Margin Leakage", "Retail BI"],
  authors: [{ name: "Retail Insights Engineering Team" }],
  openGraph: {
    title: "Retail Insights | Enterprise Analytics Platform",
    description: "Enterprise Retail Analytics and Business Intelligence powered by Next.js and Python FastAPI.",
    url: "https://frontend-m5va.vercel.app",
    siteName: "Retail Insights",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Retail Insights | Enterprise Analytics Platform",
    description: "Executive Retail Analytics and Business Intelligence Platform",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
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
