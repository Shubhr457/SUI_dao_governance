"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  FileText,
  DollarSign,
  Users,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { RecentProposals } from "@/components/recent-proposals"
import { TreasuryOverview } from "@/components/treasury-overview"

export function DashboardOverview() {
  const [dashboardData, setDashboardData] = useState({
    totalMembers: 0,
    activeProposals: 0,
    treasuryValue: 0,
    stakedSui: 0,
    memberGrowth: 0,
    treasuryChange: 0,
    stakingChange: 0,
    recentActivity: []
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/proposals/create">Create Proposal</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalMembers}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {dashboardData.memberGrowth !== 0 && (
                <>
                  {dashboardData.memberGrowth > 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span className={dashboardData.memberGrowth > 0 ? "text-emerald-500" : "text-red-500"}>
                    {dashboardData.memberGrowth > 0 ? "+" : ""}{dashboardData.memberGrowth}%
                  </span> from last month
                </>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.activeProposals}</div>
            <p className="text-xs text-muted-foreground">Loading proposal data...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treasury Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.treasuryValue} SUI</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {dashboardData.treasuryChange !== 0 && (
                <>
                  {dashboardData.treasuryChange > 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span className={dashboardData.treasuryChange > 0 ? "text-emerald-500" : "text-red-500"}>
                    {dashboardData.treasuryChange > 0 ? "+" : ""}{dashboardData.treasuryChange}%
                  </span> from last week
                </>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staked SUI</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.stakedSui} SUI</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {dashboardData.stakingChange !== 0 && (
                <>
                  {dashboardData.stakingChange > 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span className={dashboardData.stakingChange > 0 ? "text-emerald-500" : "text-red-500"}>
                    {dashboardData.stakingChange > 0 ? "+" : ""}{dashboardData.stakingChange}%
                  </span> from last week
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="proposals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="proposals">Recent Proposals</TabsTrigger>
          <TabsTrigger value="treasury">Treasury</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="proposals" className="space-y-4">
          <RecentProposals />
        </TabsContent>
        <TabsContent value="treasury" className="space-y-4">
          <TreasuryOverview />
        </TabsContent>
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions in the DAO</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivity.length === 0 ? (
                  <div className="text-center text-muted-foreground">No recent activity</div>
                ) : (
                  dashboardData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        {activity.type === "proposal_passed" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        {activity.type === "member_joined" && <Users className="h-4 w-4 text-primary" />}
                        {activity.type === "proposal_rejected" && <XCircle className="h-4 w-4 text-primary" />}
                        {activity.type === "treasury_transaction" && <DollarSign className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {activity.timestamp}
                        </p>
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
