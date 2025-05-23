"use client"

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
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500">+12%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">3 ending in less than 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treasury Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2M SUI</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-red-500" />
              <span className="text-red-500">-3.2%</span> from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staked SUI</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">850K SUI</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500">+5.4%</span> from last week
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
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Proposal #42 Passed</p>
                    <p className="text-xs text-muted-foreground">Treasury allocation for marketing campaign</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">New Member Joined</p>
                    <p className="text-xs text-muted-foreground">0x7a3b...f921 acquired governance tokens</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 5 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <XCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Proposal #41 Rejected</p>
                    <p className="text-xs text-muted-foreground">Change in validator selection criteria</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 1 day ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Treasury Transaction</p>
                    <p className="text-xs text-muted-foreground">50,000 SUI transferred to development fund</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 2 days ago
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
