import { DashboardLayout } from "@/components/dashboard-layout"
import { ProposalsList } from "@/components/proposals-list"

export default function ProposalsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
        </div>
        <ProposalsList />
      </div>
    </DashboardLayout>
  )
}
