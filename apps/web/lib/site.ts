const DEFAULT_SITE_URL = "https://devlog-azure.vercel.app";

function normalizeSiteUrl(value?: string | null) {
  if (!value) return DEFAULT_SITE_URL;

  const withProtocol = value.startsWith("http") ? value : `https://${value}`;
  return withProtocol.replace(/\/$/, "");
}

export const siteConfig = {
  name: "devlog",
  title: "devlog | GitHub Wrapped Dashboard for Developers",
  description:
    "devlog turns your GitHub activity into a shareable annual dashboard with contribution trends, PR highlights, language insights, and AI-assisted summaries.",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL),
  keywords: [
    "devlog",
    "github wrapped",
    "github dashboard",
    "developer analytics",
    "pull request insights",
    "github contributions",
  ],
};
