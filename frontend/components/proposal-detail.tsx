"use client"

import { useState } from "react"
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

  // Mock data for a proposal
  const proposal = {
    id,
    title: "Increase Validator Rewards",
    description:
      "This proposal aims to increase the rewards for validators by 2% to incentivize more participation in the network. By increasing rewards, we expect to attract more validators, which will enhance the security and decentralization of our network.",
    status: "active",
    endTime: "2 days",
    createdAt: "May 20, 2025",
    author: {
      address: "0x7a3b...f921",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    votes: {
      for: 65,
      against: 35,
      total: 850000,
      quorum: 30,
    },
    details: {
      quorum: "30% of total voting power",
      threshold: "Simple majority (>50%)",
      votingPeriod: "7 days",
      implementation: "Automatic execution upon approval",
    },
    discussion: [
      {
        author: {
          address: "0x7a3b...f921",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        content:
          "I believe this proposal is essential for the long-term health of our network. Increasing validator rewards will attract more participants.",
        timestamp: "2 days ago",
      },
      {
        author: {
          address: "0x3c4d...e832",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        content:
          "While I understand the intent, I'm concerned about the inflationary pressure this might create. Has there been an economic analysis?",
        timestamp: "1 day ago",
      },
      {
        author: {
          address: "0x9f2e...b743",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        content:
          "I support this proposal. The increased security from more validators outweighs the minimal inflation impact.",
        timestamp: "12 hours ago",
      },
    ],
  }

  const handleVote = (vote: "for" | "against") => {
    // In a real implementation, this would send a transaction to the blockchain
    console.log(`Voting ${vote} on proposal ${id}`)
    setHasVoted(true)
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
                  <dd className="text-sm">{proposal.details.quorum}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Approval Threshold</dt>
                  <dd className="text-sm">{proposal.details.threshold}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Voting Period</dt>
                  <dd className="text-sm">{proposal.details.votingPeriod}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Implementation</dt>
                  <dd className="text-sm">{proposal.details.implementation}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="discussion">
          <Card>
            <CardHeader>
              <CardTitle>Community Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposal.discussion.map((comment, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt="Avatar" />
                        <AvatarFallback>{comment.author.address.substring(2, 4).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{comment.author.address}</p>
                        <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                      </div>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    {index < proposal.discussion.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Votes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    voter: "0x3c4d...e832",
                    vote: "against",
                    power: "25,000 SUI",
                    time: "1 day ago",
                  },
                  {
                    voter: "0x9f2e...b743",
                    vote: "for",
                    power: "42,000 SUI",
                    time: "1 day ago",
                  },
                  {
                    voter: "0x5d1f...a621",
                    vote: "for",
                    power: "18,500 SUI",
                    time: "2 days ago",
                  },
                  {
                    voter: "0x2b8c...d934",
                    vote: "for",
                    power: "31,000 SUI",
                    time: "2 days ago",
                  },
                  {
                    voter: "0x6e7a...c412",
                    vote: "against",
                    power: "15,000 SUI",
                    time: "3 days ago",
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`rounded-full p-1 ${activity.vote === "for" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                      >
                        {activity.vote === "for" ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.voter}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-medium ${activity.vote === "for" ? "text-green-600" : "text-red-600"}`}>
                      {activity.power}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
