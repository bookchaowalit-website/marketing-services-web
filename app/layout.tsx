import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Services | Bookchaowalit",
  description: "Catalog of services you offer.",
  keywords: ["services", "portfolio"],
  authors: [{ name: "Bookchaowalit", url: "https://bookchaowalit.com" }],
  creator: "Bookchaowalit",
  metadataBase: new URL("https://services.bookchaowalit.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Services | Bookchaowalit",
    description: "Catalog of services you offer.",
    siteName: "Bookchaowalit",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body>
        {children}
      </body>
    </html>
  );
}
