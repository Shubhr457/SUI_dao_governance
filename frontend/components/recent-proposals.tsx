"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, ArrowRight } from "lucide-react"

export function RecentProposals() {
  const [proposals, setProposals] = useState([])

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
      {proposals.length === 0 ? (
        <div className="text-center text-muted-foreground">No recent proposals</div>
      ) : (
        proposals.map((proposal) => (
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
        ))
      )}
      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/proposals">View All Proposals</Link>
        </Button>
      </div>
    </div>
  )
}
