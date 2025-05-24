"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Clock, ArrowRight, Search } from "lucide-react"
import { useCurrentDAO } from "@/hooks/useDAO"
import { Proposal } from "@/lib/types"
import { daoGovernanceClient } from "@/lib/sui-client"
import { Spinner } from "@/components/ui/spinner"

export function ProposalsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [proposals, setProposals] = useState({
    active: [] as Proposal[],
    passed: [] as Proposal[],
    rejected: [] as Proposal[],
    executed: [] as Proposal[]
  })
  
  const { currentDAOId } = useCurrentDAO()

  // Function to retrieve proposals from localStorage directly in the component
  const getLocalProposals = (daoId: string) => {
    if (typeof window === 'undefined') return [];
    
    const localProposals: Proposal[] = [];
    const normalizedDAOId = daoId.toLowerCase();
    
    // Check localStorage for any saved proposals
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('proposal-')) {
        try {
          const storedData = JSON.parse(localStorage.getItem(key) || '{}');
          
          // Check if this proposal belongs to the current DAO
          if (storedData.daoId && 
              (storedData.daoId === normalizedDAOId || 
                storedData.daoId.toLowerCase() === normalizedDAOId)) {
            
            console.log('Found locally stored proposal in component:', key);
            
            // Extract proposal ID from the key or use a timestamp
            let proposalId: number;
            const keyParts = key.split('-');
            if (keyParts.length > 2 && !isNaN(Number(keyParts[keyParts.length - 1]))) {
              proposalId = Number(keyParts[keyParts.length - 1]);
            } else {
              proposalId = storedData.timestamp ? Math.floor(storedData.timestamp / 1000) : Date.now();
            }
            
            // Determine title and description
            const title = storedData.title || 
              (storedData.proposalEvent?.parsedJson?.title) || 
              'Untitled Proposal';
              
            const description = storedData.description || 
              (storedData.proposalEvent?.parsedJson?.description) || 
              'No description';
            
            // Create a proposal object
            const proposal: Proposal = {
              id: proposalId,
              proposer: storedData.proposer || '',
              title: title,
              description: description,
              proposal_type: { code: storedData.proposal_type || 0 },
              status: { code: 0 }, // Default to active
              created_at: storedData.timestamp ? Math.floor(storedData.timestamp / 1000) : Math.floor(Date.now() / 1000),
              voting_ends_at: Math.floor(Date.now() / 1000) + 86400, // Default to 24 hours from now
              execution_time: 0,
              yes_votes: 0,
              no_votes: 0,
              voters: [],
              treasury_transfer_amount: 0,
              treasury_transfer_recipient: '',
              parameter_key: '',
              parameter_value: 0,
              validator_address: ''
            };
            
            localProposals.push(proposal);
          }
        } catch (error) {
          console.error('Error parsing stored proposal:', error);
        }
      }
    }
    
    return localProposals;
  };

  // Fetch proposals when currentDAOId changes
  useEffect(() => {
    async function fetchProposals() {
      if (!currentDAOId) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Normalize the DAO ID to ensure consistent format
        const normalizedDAOId = currentDAOId.toLowerCase()
        console.log('Fetching proposals for normalized DAO ID:', normalizedDAOId)
        
        // First try to get proposals from the blockchain
        const blockchainProposals = await daoGovernanceClient.getDAOProposals(normalizedDAOId)
        console.log('Fetched blockchain proposals:', blockchainProposals)
        
        // Then get any locally stored proposals
        const localProposals = getLocalProposals(normalizedDAOId)
        console.log('Fetched local proposals:', localProposals)
        
        // Combine both sources (blockchain takes precedence for duplicates)
        const allProposals = [...localProposals];
        
        // Add blockchain proposals, avoiding duplicates by ID
        for (const proposal of blockchainProposals) {
          if (!allProposals.some(p => p.id === proposal.id)) {
            allProposals.push(proposal);
          }
        }
        
        console.log('Combined proposals:', allProposals)
        
        // Categorize proposals by status
        const active: Proposal[] = []
        const passed: Proposal[] = []
        const rejected: Proposal[] = []
        const executed: Proposal[] = []

        allProposals.forEach(proposal => {
          switch (proposal.status.code) {
            case 0: // Active
              active.push(proposal)
              break
            case 1: // Passed
              passed.push(proposal)
              break
            case 2: // Failed/Rejected
              rejected.push(proposal)
              break
            case 3: // Executed
              executed.push(proposal)
              break
          }
        })

        setProposals({ active, passed, rejected, executed })
      } catch (error) {
        console.error('Error fetching proposals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProposals()
  }, [currentDAOId])

  const getStatusColor = (statusCode: number) => {
    switch (statusCode) {
      case 0: // Active
        return "bg-blue-500 hover:bg-blue-600"
      case 1: // Passed
        return "bg-green-500 hover:bg-green-600"
      case 2: // Failed/Rejected
        return "bg-red-500 hover:bg-red-600"
      case 3: // Executed
        return "bg-purple-500 hover:bg-purple-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }
  
  const getStatusText = (statusCode: number) => {
    switch (statusCode) {
      case 0: return "Active"
      case 1: return "Passed"
      case 2: return "Rejected"
      case 3: return "Executed"
      default: return "Unknown"
    }
  }

  const renderProposalCard = (proposal: Proposal) => {
    // Calculate vote percentages
    const totalVotes = proposal.yes_votes + proposal.no_votes
    const forPercentage = totalVotes > 0 ? Math.round((proposal.yes_votes / totalVotes) * 100) : 0
    const againstPercentage = totalVotes > 0 ? Math.round((proposal.no_votes / totalVotes) * 100) : 0
    
    // Format end time
    const endTime = new Date(proposal.voting_ends_at * 1000).toLocaleString()
    
    // Truncate long titles and descriptions for mobile
    const truncateText = (text: string, maxLength: number) => {
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
    }
    
    return (
      <Card key={proposal.id} className="overflow-hidden">
        <CardHeader className="pb-2 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-lg sm:text-xl break-words">
              {truncateText(proposal.title, 50)}
            </CardTitle>
            <Badge className={`${getStatusColor(proposal.status.code)} whitespace-nowrap`}>
              {getStatusText(proposal.status.code)}
            </Badge>
          </div>
          <CardDescription className="text-xs sm:text-sm mt-1 line-clamp-2">
            {truncateText(proposal.description, 120)}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span>For: {forPercentage}%</span>
              <span>Against: {againstPercentage}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${forPercentage}%` }} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="break-all">{endTime}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-4 sm:px-6">
          <Button variant="ghost" size="sm" className="w-full sm:w-auto sm:ml-auto gap-1" asChild>
            <Link href={`/proposals/${proposal.id}`} className="flex items-center justify-center">
              View Details <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Search proposals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Button type="submit" size="icon" variant="ghost">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/proposals/create">Create Proposal</Link>
        </Button>
      </div>

      {!currentDAOId ? (
        <div className="text-center p-4 sm:p-8 text-muted-foreground">
          No DAO selected. Please select a DAO to view its proposals.
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center p-8 sm:p-12">
          <Spinner size="lg" />
          <span className="ml-2">Loading proposals...</span>
        </div>
      ) : (
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="flex flex-wrap w-full overflow-x-auto">
            <TabsTrigger value="active" className="text-xs sm:text-sm">Active ({proposals.active.length})</TabsTrigger>
            <TabsTrigger value="passed" className="text-xs sm:text-sm">Passed ({proposals.passed.length})</TabsTrigger>
            <TabsTrigger value="rejected" className="text-xs sm:text-sm">Rejected ({proposals.rejected.length})</TabsTrigger>
            <TabsTrigger value="executed" className="text-xs sm:text-sm">Executed ({proposals.executed.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-4">
            {proposals.active.length === 0 ? (
              <div className="text-center text-muted-foreground">No active proposals</div>
            ) : (
              proposals.active.map(renderProposalCard)
            )}
          </TabsContent>
          <TabsContent value="passed" className="space-y-4">
            {proposals.passed.length === 0 ? (
              <div className="text-center text-muted-foreground">No passed proposals</div>
            ) : (
              proposals.passed.map(renderProposalCard)
            )}
          </TabsContent>
          <TabsContent value="rejected" className="space-y-4">
            {proposals.rejected.length === 0 ? (
              <div className="text-center text-muted-foreground">No rejected proposals</div>
            ) : (
              proposals.rejected.map(renderProposalCard)
            )}
          </TabsContent>
          <TabsContent value="executed" className="space-y-4">
            {proposals.executed.length === 0 ? (
              <div className="text-center text-muted-foreground">No executed proposals</div>
            ) : (
              proposals.executed.map(renderProposalCard)
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
