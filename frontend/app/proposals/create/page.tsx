import { DashboardLayout } from "@/components/dashboard-layout"
import { CreateProposalForm } from "@/components/create-proposal-form"

export default function CreateProposalPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Create Proposal</h1>
        </div>
        <CreateProposalForm />
      </div>
    </DashboardLayout>
  )
}
