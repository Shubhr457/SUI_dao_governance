"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Send, 
  History, 
  PieChart,
  TrendingUp,
  Wallet
} from "lucide-react"

export function TreasuryDashboard() {
  const [treasuryData, setTreasuryData] = useState({
    totalBalance: 0,
    availableBalance: 0,
    lockedBalance: 0,
    totalInflow: 0,
    totalOutflow: 0,
    assetAllocation: [],
    recentTransactions: [],
    pendingProposals: []
  })

  const [sendAmount, setSendAmount] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")

  const handleSendFunds = () => {
    // TODO: Implement treasury fund sending transaction
    console.log("Sending funds:", { amount: sendAmount, recipient: recipientAddress })
  }

  return (
    <div className="space-y-6">
      {/* Treasury Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{treasuryData.totalBalance} SUI</div>
            <p className="text-xs text-muted-foreground">Loading USD value...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{treasuryData.availableBalance} SUI</div>
            <p className="text-xs text-muted-foreground">Ready for proposals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inflow</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{treasuryData.totalInflow} SUI</div>
            <p className="text-xs text-muted-foreground">From staking & fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outflow</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{treasuryData.totalOutflow} SUI</div>
            <p className="text-xs text-muted-foreground">Via proposals</p>
          </CardContent>
        </Card>
      </div>

      {/* Treasury Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <PieChart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <History className="h-4 w-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="proposals">
            <Send className="h-4 w-4 mr-2" />
            Spending Proposals
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>Distribution of treasury assets</CardDescription>
              </CardHeader>
              <CardContent>
                {treasuryData.assetAllocation.length === 0 ? (
                  <div className="text-center text-muted-foreground">No asset data available</div>
                ) : (
                  <div className="space-y-4">
                    {treasuryData.assetAllocation.map((asset, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{asset.name}</span>
                          <span className="text-sm">{asset.amount} SUI</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div 
                            className="h-full rounded-full bg-primary" 
                            style={{ width: `${asset.percentage}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Treasury management actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="send-amount">Send Amount (SUI)</Label>
                  <Input
                    id="send-amount"
                    type="number"
                    placeholder="0"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input
                    id="recipient"
                    placeholder="0x..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSendFunds}
                  disabled={!sendAmount || !recipientAddress}
                >
                  Create Transfer Proposal
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  This will create a proposal for community voting
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent treasury transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {treasuryData.recentTransactions.length === 0 ? (
                <div className="text-center text-muted-foreground">No transactions found</div>
              ) : (
                <div className="space-y-4">
                  {treasuryData.recentTransactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <div className={`rounded-full p-1 ${
                          tx.type === "inflow" 
                            ? "bg-green-100 text-green-600" 
                            : "bg-red-100 text-red-600"
                        }`}>
                          {tx.type === "inflow" ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{tx.timestamp}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          tx.type === "inflow" ? "text-green-600" : "text-red-600"
                        }`}>
                          {tx.type === "inflow" ? "+" : "-"}{tx.amount} SUI
                        </p>
                        <p className="text-xs text-muted-foreground">{tx.txHash}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Treasury Proposals</CardTitle>
              <CardDescription>Proposals requesting treasury funds</CardDescription>
            </CardHeader>
            <CardContent>
              {treasuryData.pendingProposals.length === 0 ? (
                <div className="text-center text-muted-foreground">No pending treasury proposals</div>
              ) : (
                <div className="space-y-4">
                  {treasuryData.pendingProposals.map((proposal, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">{proposal.title}</h3>
                        <Badge variant="outline">{proposal.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{proposal.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{proposal.amount} SUI</span>
                        <span className="text-xs text-muted-foreground">{proposal.endTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Treasury Analytics</CardTitle>
              <CardDescription>Financial performance and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                Analytics data will be available once treasury activity begins
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 