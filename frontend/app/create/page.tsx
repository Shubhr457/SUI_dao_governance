import { DashboardLayout } from "@/components/dashboard-layout"
import { CreateDaoForm } from "@/components/create-dao-form"

export default function CreateDaoPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Create DAO</h1>
        </div>
        <CreateDaoForm />
      </div>
    </DashboardLayout>
  )
}
