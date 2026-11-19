import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const DESCRIPTION = "A Bookchaowalit demo: a small catalog of services you offer, with lists, search and undo. Everything stays in your browser.";

export const metadata: Metadata = {
  title: "Services | Bookchaowalit",
  description: DESCRIPTION,
  keywords: ["services", "portfolio"],
  authors: [{ name: "Bookchaowalit", url: "https://bookchaowalit.com" }],
  creator: "Bookchaowalit",
  metadataBase: new URL("https://services.bookchaowalit.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Services | Bookchaowalit",
    description: DESCRIPTION,
    siteName: "Bookchaowalit",
  },
  twitter: { card: "summary_large_image", title: "Services | Bookchaowalit", description: DESCRIPTION },
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
