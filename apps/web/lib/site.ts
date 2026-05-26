const DEFAULT_SITE_URL = "https://devlog-azure.vercel.app";

function normalizeSiteUrl(value?: string | null) {
  if (!value) return DEFAULT_SITE_URL;

  const withProtocol = value.startsWith("http") ? value : `https://${value}`;
  return withProtocol.replace(/\/$/, "");
}

export const siteConfig = {
  name: "devlog",
  title: "devlog | GitHub Wrapped Dashboard and Developer Analytics",
  description:
    "devlog is a GitHub Wrapped dashboard for developers with contribution analytics, pull request highlights, language trends, review insights, and shareable annual summaries.",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL),
  keywords: [
    "devlog",
    "github wrapped",
    "github dashboard",
    "developer analytics",
    "developer dashboard",
    "github analytics",
    "contribution analytics",
    "pull request insights",
    "github contribution tracker",
    "annual developer summary",
    "github contributions",
  ],
};
