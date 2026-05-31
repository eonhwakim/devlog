import { auth } from "@/auth";
import { DashboardExperience } from "@/components/dashboard/DashboardExperience";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardPageStateProvider } from "@/components/dashboard/DashboardPageState";
import { DASHBOARD_QUERY, ONE_YEAR_MS, type DashboardQueryResult } from "@/lib/dashboard/query";
import { buildDashboardViewModel } from "@/lib/dashboard/transform";
import { graphql } from "@octokit/graphql";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/");

  const client = graphql.defaults({
    headers: { authorization: `token ${session.accessToken}` },
  });

  const now = new Date();
  const from = new Date(now.getTime() - ONE_YEAR_MS);

  const data = await client<DashboardQueryResult>(DASHBOARD_QUERY, {
    from: from.toISOString(),
    to: now.toISOString(),
  });

  const dashboard = buildDashboardViewModel(data, from, now);

  return (
    <DashboardPageStateProvider>
      <div className="dashboard-shell dashboard-theme-toast min-h-screen font-sans">
        <div className="dashboard-noise" />
        <DashboardHeader viewer={dashboard.viewer} />
        <DashboardExperience {...dashboard} />
      </div>
    </DashboardPageStateProvider>
  );
}
