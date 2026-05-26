import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salary Report",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function SalaryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
