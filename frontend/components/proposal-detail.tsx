"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Clock, ArrowUpRight, ArrowDownRight, FileText, MessageSquare, Activity } from "lucide-react"

export function ProposalDetail({ id }: { id: string }) {
  const [hasVoted, setHasVoted] = useState(false)
  const [proposal, setProposal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch proposal data from blockchain
    setLoading(false)
  }, [id])

  const handleVote = (vote: "for" | "against") => {
    // TODO: Implement actual blockchain vote transaction
    console.log(`Voting ${vote} on proposal ${id}`)
    setHasVoted(true)
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading proposal...</div>
  }

  if (!proposal) {
    return <div className="text-center text-muted-foreground">Proposal not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{proposal.title}</h1>
          <Badge
            className={
              proposal.status === "active"
                ? "bg-blue-500 hover:bg-blue-600"
                : proposal.status === "passed"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
            }
          >
            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Created by {proposal.author.address}</span>
          <span>•</span>
          <span>{proposal.createdAt}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proposal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{proposal.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Voting</CardTitle>
          {proposal.status === "active" && (
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Ends in {proposal.endTime}</span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                  <span>For: {proposal.votes.for}%</span>
                </div>
                <span>{Math.round((proposal.votes.total * proposal.votes.for) / 100).toLocaleString()} SUI</span>
              </div>
              <Progress value={proposal.votes.for} className="h-2 w-full bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                  <span>Against: {proposal.votes.against}%</span>
                </div>
                <span>{Math.round((proposal.votes.total * proposal.votes.against) / 100).toLocaleString()} SUI</span>
              </div>
              <Progress value={proposal.votes.against} className="h-2 w-full bg-muted" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Quorum: {proposal.votes.quorum}% required</span>
              <span>{proposal.votes.total.toLocaleString()} SUI voted</span>
            </div>
          </div>
        </CardContent>
        {proposal.status === "active" && (
          <CardFooter className="flex justify-between gap-2">
            {!hasVoted ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                  onClick={() => handleVote("against")}
                >
                  Vote Against
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() => handleVote("for")}
                >
                  Vote For
                </Button>
              </>
            ) : (
              <div className="w-full text-center text-sm text-muted-foreground">
                Thank you for voting! Your vote has been recorded.
              </div>
            )}
          </CardFooter>
        )}
      </Card>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">
            <FileText className="h-4 w-4 mr-2" />
            Governance Details
          </TabsTrigger>
          <TabsTrigger value="discussion">
            <MessageSquare className="h-4 w-4 mr-2" />
            Discussion
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Voting Activity
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Governance Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Quorum</dt>
                  <dd className="text-sm">{proposal.details?.quorum || "Loading..."}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Threshold</dt>
                  <dd className="text-sm">{proposal.details?.threshold || "Loading..."}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Voting Period</dt>
                  <dd className="text-sm">{proposal.details?.votingPeriod || "Loading..."}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Implementation</dt>
                  <dd className="text-sm">{proposal.details?.implementation || "Loading..."}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="discussion">
          <Card>
            <CardHeader>
              <CardTitle>Discussion</CardTitle>
              <CardDescription>Community discussion about this proposal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!proposal.discussion || proposal.discussion.length === 0 ? (
                  <div className="text-center text-muted-foreground">No discussion yet</div>
                ) : (
                  proposal.discussion.map((comment, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback>{comment.author.address.slice(2, 4).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{comment.author.address}</p>
                          <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Voting Activity</CardTitle>
              <CardDescription>Recent votes on this proposal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!proposal.votingActivity || proposal.votingActivity.length === 0 ? (
                  <div className="text-center text-muted-foreground">No voting activity yet</div>
                ) : (
                  proposal.votingActivity.map((vote, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{vote.voter.slice(2, 4).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{vote.voter}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={vote.choice === "for" ? "bg-green-500" : "bg-red-500"}>
                          {vote.choice === "for" ? "For" : "Against"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{vote.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
