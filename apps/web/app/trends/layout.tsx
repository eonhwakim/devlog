import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trends",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function TrendsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
