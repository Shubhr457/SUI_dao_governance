import { DashboardLayout } from "@/components/dashboard-layout"
import { StakingDashboard } from "@/components/staking-dashboard"

export default function StakingPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Staking</h1>
        </div>
        <StakingDashboard />
      </div>
    </DashboardLayout>
  )
}
