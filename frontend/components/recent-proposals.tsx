import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, ArrowRight } from "lucide-react"

export function RecentProposals() {
  const proposals = [
    {
      id: "1",
      title: "Increase Validator Rewards",
      description: "Proposal to increase the rewards for validators by 2% to incentivize more participation",
      status: "active",
      endTime: "2 days",
      votes: { for: 65, against: 35 },
    },
    {
      id: "2",
      title: "Treasury Allocation for Marketing",
      description: "Allocate 50,000 SUI from the treasury for a marketing campaign to increase DAO visibility",
      status: "active",
      endTime: "12 hours",
      votes: { for: 78, against: 22 },
    },
    {
      id: "3",
      title: "Add New Validator Selection Criteria",
      description: "Implement new performance-based criteria for validator selection",
      status: "active",
      endTime: "4 days",
      votes: { for: 42, against: 58 },
    },
    {
      id: "4",
      title: "Governance Token Distribution",
      description: "Distribute 100,000 governance tokens to early contributors",
      status: "passed",
      endTime: "ended",
      votes: { for: 92, against: 8 },
    },
    {
      id: "5",
      title: "Reduce Proposal Submission Threshold",
      description: "Lower the token threshold required to submit proposals from 1% to 0.5% of total supply",
      status: "rejected",
      endTime: "ended",
      votes: { for: 32, against: 68 },
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500 hover:bg-blue-600"
      case "passed":
        return "bg-green-500 hover:bg-green-600"
      case "rejected":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <Card key={proposal.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{proposal.title}</CardTitle>
              <Badge className={getStatusColor(proposal.status)}>
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </Badge>
            </div>
            <CardDescription>{proposal.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>For: {proposal.votes.for}%</span>
                <span>Against: {proposal.votes.against}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${proposal.votes.for}%` }} />
                </div>
              </div>
              {proposal.status === "active" && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Ends in {proposal.endTime}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="ml-auto gap-1" asChild>
              <Link href={`/proposals/${proposal.id}`}>
                View Details <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/proposals">View All Proposals</Link>
        </Button>
      </div>
    </div>
  )
}
