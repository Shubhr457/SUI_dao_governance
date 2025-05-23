"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ProposalDetail } from "@/components/proposal-detail"
import { useParams } from "next/navigation"

// Client component that uses useParams hook to access route params
export default function ProposalDetailPage() {
  // Use the useParams hook to safely access route parameters
  const params = useParams()
  const id = params?.id as string
  
  return (
    <DashboardLayout>
      {id ? (
        <ProposalDetail id={id} />
      ) : (
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Proposal Not Found</h2>
          <p className="text-muted-foreground">The requested proposal could not be found.</p>
        </div>
      )}
    </DashboardLayout>
  )
}
