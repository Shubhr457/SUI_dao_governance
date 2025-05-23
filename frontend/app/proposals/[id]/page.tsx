import { DashboardLayout } from "@/components/dashboard-layout"
import { ProposalDetail } from "@/components/proposal-detail"

export default function ProposalDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <ProposalDetail id={params.id} />
    </DashboardLayout>
  )
}
