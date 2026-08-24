import { PageHeader } from "@/components/PageHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardActivity } from "@/components/dashboard/DashboardActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentTasks } from "@/components/dashboard/RecentTasks";

export default function DashboardPage() {
  return (
    <div className="@container/main flex-1 space-y-4 px-2 pt-2">
      <PageHeader
        title="Dashboard"
        description="Welcome back — here is your workspace overview."
      />
      <DashboardStats />
      <DashboardCharts />
      <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2">
        <DashboardActivity />
        <div className="space-y-4">
          <QuickActions />
          <RecentTasks />
        </div>
      </div>
    </div>
  );
}