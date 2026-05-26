import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Score",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ScoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
