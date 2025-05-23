"use client"

import { Switch } from "@/components/ui/switch"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Award, TrendingUp, Users, BarChart3, ArrowUpRight } from "lucide-react"

export function StakingDashboard() {
  const [stakeAmount, setStakeAmount] = useState("")
  const [isStaking, setIsStaking] = useState(false)

  const handleStake = () => {
    setIsStaking(true)
    // Simulate staking transaction
    setTimeout(() => {
      setIsStaking(false)
      setStakeAmount("")
    }, 2000)
  }

  const validators = [
    {
      name: "Validator Alpha",
      address: "0x7a3b...f921",
      performance: 99.8,
      commission: 5,
      votingPower: 120000,
      status: "active",
    },
    {
      name: "Validator Beta",
      address: "0x3c4d...e832",
      performance: 99.5,
      commission: 7,
      votingPower: 85000,
      status: "active",
    },
    {
      name: "Validator Gamma",
      address: "0x9f2e...b743",
      performance: 98.9,
      commission: 4,
      votingPower: 65000,
      status: "active",
    },
    {
      name: "Validator Delta",
      address: "0x5d1f...a621",
      performance: 99.2,
      commission: 6,
      votingPower: 95000,
      status: "active",
    },
    {
      name: "Validator Epsilon",
      address: "0x2b8c...d934",
      performance: 97.5,
      commission: 3,
      votingPower: 45000,
      status: "jailed",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">850,000 SUI</div>
            <p className="text-xs text-muted-foreground">≈ $1,700,000 USD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">APY</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8%</div>
            <p className="text-xs text-muted-foreground">+0.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Validators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Out of 5 total validators</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Stake</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25,000 SUI</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500">+1,200 SUI</span> rewards
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stake" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stake">Stake & Unstake</TabsTrigger>
          <TabsTrigger value="validators">Validators</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>
        <TabsContent value="stake">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stake SUI</CardTitle>
                <CardDescription>Stake your SUI tokens to earn rewards and participate in governance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stake-amount">Amount to Stake</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="stake-amount"
                      type="number"
                      placeholder="0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                    />
                    <Button variant="outline" onClick={() => setStakeAmount("25000")}>
                      Max
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Available: 25,000 SUI</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Validator Selection</Label>
                    <span className="text-xs text-muted-foreground">Auto-select best validators</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto-select"
                      className="h-4 w-4 rounded border-gray-300"
                      defaultChecked
                    />
                    <Label htmlFor="auto-select" className="text-sm">
                      Auto-select validators based on performance
                    </Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleStake} disabled={!stakeAmount || isStaking}>
                  {isStaking ? "Processing..." : "Stake SUI"}
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Unstake SUI</CardTitle>
                <CardDescription>Unstake your SUI tokens with a 7-day unbonding period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="unstake-amount">Amount to Unstake</Label>
                  <div className="flex items-center space-x-2">
                    <Input id="unstake-amount" type="number" placeholder="0" />
                    <Button variant="outline">Max</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Staked: 25,000 SUI</p>
                </div>
                <div className="space-y-1">
                  <Label>Unbonding Period</Label>
                  <p className="text-sm">7 days</p>
                  <p className="text-xs text-muted-foreground">
                    Your tokens will be locked for 7 days before they can be withdrawn
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Unstake SUI
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="validators">
          <Card>
            <CardHeader>
              <CardTitle>Validator Selection</CardTitle>
              <CardDescription>Choose validators to delegate your stake</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validators.map((validator, index) => (
                  <div key={index} className="flex flex-col space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Award className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">{validator.name}</h3>
                          <p className="text-xs text-muted-foreground">{validator.address}</p>
                        </div>
                      </div>
                      <Badge className={validator.status === "active" ? "bg-green-500" : "bg-red-500"}>
                        {validator.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Performance</p>
                        <p className="font-medium">{validator.performance}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Commission</p>
                        <p className="font-medium">{validator.commission}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Voting Power</p>
                        <p className="font-medium">{validator.votingPower.toLocaleString()} SUI</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`validator-${index}`}
                          className="h-4 w-4 rounded border-gray-300"
                          disabled={validator.status !== "active"}
                        />
                        <Label htmlFor={`validator-${index}`} className="text-sm">
                          Select for delegation
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`allocation-${index}`} className="text-sm">
                          Allocation
                        </Label>
                        <Input
                          id={`allocation-${index}`}
                          type="number"
                          className="w-20 h-8"
                          placeholder="0%"
                          disabled={validator.status !== "active"}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Update Delegation</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Staking Rewards</CardTitle>
              <CardDescription>Track and claim your staking rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-lg font-medium">Available Rewards</h3>
                  <div className="text-2xl font-bold">1,200 SUI</div>
                  <p className="text-sm text-muted-foreground">≈ $2,400 USD</p>
                  <Button className="mt-2">Claim Rewards</Button>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Reward History</h3>
                <div className="space-y-4">
                  {[
                    { date: "May 21, 2025", amount: "250 SUI", status: "Claimed" },
                    { date: "May 14, 2025", amount: "245 SUI", status: "Claimed" },
                    { date: "May 7, 2025", amount: "240 SUI", status: "Claimed" },
                    { date: "Apr 30, 2025", amount: "235 SUI", status: "Claimed" },
                    { date: "Apr 23, 2025", amount: "230 SUI", status: "Claimed" },
                  ].map((reward, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="text-sm font-medium">{reward.date}</p>
                        <p className="text-xs text-muted-foreground">{reward.status}</p>
                      </div>
                      <p className="text-sm font-medium">{reward.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Reward Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-compound">Auto-compound Rewards</Label>
                      <p className="text-xs text-muted-foreground">Automatically stake your rewards</p>
                    </div>
                    <Switch id="auto-compound" />
                  </div>
                  <div className="space-y-2">
                    <Label>Reward Distribution</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Stake</span>
                      <Slider defaultValue={[75]} max={100} step={1} className="flex-1" />
                      <span className="text-sm">Claim</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      75% of rewards will be automatically restaked, 25% will be available to claim
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
