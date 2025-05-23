import { DashboardLayout } from "@/components/dashboard-layout"
import { TreasuryDashboard } from "@/components/treasury-dashboard"

export default function TreasuryPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Treasury</h1>
        </div>
        <TreasuryDashboard />
      </div>
    </DashboardLayout>
  )
}
