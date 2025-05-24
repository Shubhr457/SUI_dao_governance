"use client"

import { useState, useEffect } from "react"
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
import { useCurrentDAO } from "@/hooks/useDAO"
import { daoGovernanceClient } from "@/lib/sui-client"

export function DashboardOverview() {
  const { currentDAOId } = useCurrentDAO()
  const [loading, setLoading] = useState(true)
  // Define activity type interface
  interface ActivityItem {
    type: string;
    title: string;
    description: string;
    timestamp: string;
  }
  
  const [dashboardData, setDashboardData] = useState({
    totalMembers: 0,
    activeProposals: 0,
    treasuryValue: 0,
    stakedSui: 0,
    memberGrowth: 0,
    treasuryChange: 0,
    stakingChange: 0,
    recentActivity: [] as ActivityItem[]
  })
  
  // Define proposal type interface for the dashboard
  interface ProposalData {
    id: number;
    status: { code: number };
  }
  
  // Define activity type interface
  interface ActivityItem {
    type: string;
    title: string;
    description: string;
    timestamp: string;
  }
  
  // Function to retrieve proposal count from both blockchain and localStorage
  useEffect(() => {
    async function fetchDashboardData() {
      if (!currentDAOId) {
        setLoading(false)
        return
      }

      try {
        // Normalize the DAO ID to ensure consistent format
        const normalizedDAOId = currentDAOId.toLowerCase()
        
        // Attempt to get proposals from the blockchain
        let blockchainProposals: ProposalData[] = []
        try {
          blockchainProposals = await daoGovernanceClient.getDAOProposals(normalizedDAOId)
        } catch (error) {
          console.error('Error fetching blockchain proposals:', error)
        }
        
        // Get any locally stored proposals
        const localProposals = getLocalProposals(normalizedDAOId)
        
        // Add logging to debug the proposal counts
        console.log('Local proposals in dashboard:', localProposals.length, localProposals)
        console.log('Blockchain proposals in dashboard:', blockchainProposals.length, blockchainProposals)
        
        // Create a Map to track unique proposals by ID
        const uniqueProposalsMap = new Map()
        
        // Add local proposals to the map
        localProposals.forEach(proposal => {
          uniqueProposalsMap.set(proposal.id, proposal)
        })
        
        // Add blockchain proposals to the map (will overwrite duplicates)
        blockchainProposals.forEach(proposal => {
          uniqueProposalsMap.set(proposal.id, proposal)
        })
        
        // Convert map back to array
        const allProposals = Array.from(uniqueProposalsMap.values())
        console.log('Unique combined proposals in dashboard:', allProposals.length, allProposals)
        
        // Count active proposals (status code 0)
        const activeProposals = allProposals.filter(p => p.status.code === 0).length
        console.log('Active proposal count in dashboard:', activeProposals)
        
        // Update dashboard data
        setDashboardData(prev => ({
          ...prev,
          activeProposals
        }))
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [currentDAOId])
  
  // Helper function to get proposals from localStorage
  const getLocalProposals = (daoId: string) => {
    if (typeof window === 'undefined') return []
    
    const localProposals = []
    const normalizedDAOId = daoId.toLowerCase()
    const processedKeys = new Set() // Track processed keys to avoid duplicates
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('proposal-') && !processedKeys.has(key)) {
        processedKeys.add(key)
        try {
          const storedData = JSON.parse(localStorage.getItem(key) || '{}')
          
          if (storedData.daoId && 
              (storedData.daoId === normalizedDAOId || 
                storedData.daoId.toLowerCase() === normalizedDAOId)) {
            
            // Extract proposal ID from the key
            let proposalId: number
            const keyParts = key.split('-')
            if (keyParts.length > 2 && !isNaN(Number(keyParts[keyParts.length - 1]))) {
              proposalId = Number(keyParts[keyParts.length - 1])
            } else {
              proposalId = storedData.id || Date.now()
            }
            
            console.log(`Dashboard parsed proposal ${key} with ID:`, proposalId)
            
            localProposals.push({
              id: proposalId,
              status: { code: storedData.status?.code || 0 }
            })
          }
        } catch (error) {
          console.error('Error parsing stored proposal:', error)
        }
      }
    }
    
    return localProposals
  }

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
            <div className="text-2xl font-bold">
              {loading ? (
                <span className="text-muted-foreground text-lg">...</span>
              ) : (
                dashboardData.activeProposals
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Loading proposals...' : dashboardData.activeProposals === 1 ? '1 proposal active' : `${dashboardData.activeProposals} proposals active`}
            </p>
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
