"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DollarSign, ArrowUpRight, ArrowDownRight, PieChart, BarChart3, TrendingUp } from "lucide-react"
import Link from "next/link"

export function TreasuryOverview() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,200,000 SUI</div>
            <p className="text-xs text-muted-foreground">≈ $2,400,000 USD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Inflow</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,000 SUI</div>
            <p className="text-xs text-muted-foreground">From staking rewards and fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Outflow</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32,000 SUI</div>
            <p className="text-xs text-muted-foreground">For operations and grants</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="allocation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="allocation">
            <PieChart className="h-4 w-4 mr-2" />
            Asset Allocation
          </TabsTrigger>
          <TabsTrigger value="history">
            <BarChart3 className="h-4 w-4 mr-2" />
            Transaction History
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>
        <TabsContent value="allocation">
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>Current distribution of treasury assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">SUI</span>
                      <span className="text-sm">70%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-[70%] rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Staked SUI</span>
                      <span className="text-sm">20%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-[20%] rounded-full bg-blue-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">LP Tokens</span>
                      <span className="text-sm">7%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-[7%] rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Other Assets</span>
                      <span className="text-sm">3%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full w-[3%] rounded-full bg-yellow-500" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent treasury transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: "outflow",
                    description: "Development Grant",
                    amount: "50,000 SUI",
                    date: "May 18, 2025",
                  },
                  {
                    type: "inflow",
                    description: "Staking Rewards",
                    amount: "12,500 SUI",
                    date: "May 15, 2025",
                  },
                  {
                    type: "outflow",
                    description: "Marketing Expenses",
                    amount: "25,000 SUI",
                    date: "May 10, 2025",
                  },
                  {
                    type: "inflow",
                    description: "Protocol Fees",
                    amount: "32,000 SUI",
                    date: "May 5, 2025",
                  },
                ].map((tx, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`rounded-full p-1 ${tx.type === "inflow" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                      >
                        {tx.type === "inflow" ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-medium ${tx.type === "inflow" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "inflow" ? "+" : "-"}
                      {tx.amount}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Treasury Performance</CardTitle>
              <CardDescription>Growth and returns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Monthly Growth</span>
                    <span className="text-sm text-emerald-500">+1.2%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full w-[60%] rounded-full bg-emerald-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quarterly Growth</span>
                    <span className="text-sm text-emerald-500">+3.8%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full w-[75%] rounded-full bg-emerald-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Annual Growth</span>
                    <span className="text-sm text-emerald-500">+12.5%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full w-[85%] rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/treasury">View Full Treasury</Link>
        </Button>
      </div>
    </div>
  )
}
