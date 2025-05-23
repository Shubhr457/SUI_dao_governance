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
  const [stakingData, setStakingData] = useState({
    totalStaked: 0,
    apy: 0,
    activeValidators: 0,
    totalValidators: 0,
    userStake: 0,
    userRewards: 0,
    validators: []
  })

  const handleStake = () => {
    setIsStaking(true)
    // TODO: Implement actual staking transaction
    setTimeout(() => {
      setIsStaking(false)
      setStakeAmount("")
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stakingData.totalStaked} SUI</div>
            <p className="text-xs text-muted-foreground">Loading USD value...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">APY</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stakingData.apy}%</div>
            <p className="text-xs text-muted-foreground">Loading historical data...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Validators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stakingData.activeValidators}</div>
            <p className="text-xs text-muted-foreground">Out of {stakingData.totalValidators} total validators</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Stake</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stakingData.userStake} SUI</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {stakingData.userRewards > 0 && (
                <>
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500">+{stakingData.userRewards} SUI</span> rewards
                </>
              )}
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
                  <p className="text-xs text-muted-foreground">Loading available balance...</p>
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
                  <p className="text-xs text-muted-foreground">Loading staked amount...</p>
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
                {stakingData.validators.length === 0 ? (
                  <div className="text-center text-muted-foreground">Loading validators...</div>
                ) : (
                  stakingData.validators.map((validator, index) => (
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
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Staking Rewards</CardTitle>
              <CardDescription>Track your staking rewards and earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stakingData.userRewards === 0 ? (
                  <div className="text-center text-muted-foreground">No rewards data available</div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Rewards</span>
                      <span className="text-sm font-medium">{stakingData.userRewards} SUI</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Reward</span>
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Next Reward</span>
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
