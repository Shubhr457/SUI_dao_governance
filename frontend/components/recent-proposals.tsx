"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, ArrowRight } from "lucide-react"
import { useCurrentDAO } from "@/hooks/useDAO"
import { Proposal } from "@/lib/types"
import { daoGovernanceClient } from "@/lib/sui-client"
import { Spinner } from "@/components/ui/spinner"

export function RecentProposals() {
  const [loading, setLoading] = useState(true)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const { currentDAOId } = useCurrentDAO()

  // Function to retrieve proposals from localStorage
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

  // Fetch proposals when component mounts or currentDAOId changes
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
        
        // First try to get proposals from the blockchain
        const blockchainProposals = await daoGovernanceClient.getDAOProposals(normalizedDAOId)
        
        // Then get any locally stored proposals
        const localProposals = getLocalProposals(normalizedDAOId)
        
        // Combine both sources (blockchain takes precedence for duplicates)
        const allProposals = [...localProposals];
        
        // Add blockchain proposals, avoiding duplicates by ID
        for (const proposal of blockchainProposals) {
          if (!allProposals.some(p => p.id === proposal.id)) {
            allProposals.push(proposal);
          }
        }
        
        // Sort by created_at timestamp (newest first)
        allProposals.sort((a, b) => b.created_at - a.created_at);
        
        // Take only the 3 most recent proposals
        setProposals(allProposals.slice(0, 3));
      } catch (error) {
        console.error('Error fetching proposals:', error)
        // Still display any local proposals if blockchain fetch fails
        const localProposals = getLocalProposals(currentDAOId.toLowerCase());
        setProposals(localProposals.slice(0, 3));
      } finally {
        setLoading(false)
      }
    }

    fetchProposals()
  }, [currentDAOId])

  // Convert status code to readable string
  const getStatusString = (statusCode: number) => {
    switch (statusCode) {
      case 0: return "active"
      case 1: return "passed"
      case 2: return "rejected"
      case 3: return "executed"
      default: return "pending"
    }
  }

  // Get appropriate color for status badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500 hover:bg-blue-600"
      case "passed":
        return "bg-green-500 hover:bg-green-600"
      case "rejected":
        return "bg-red-500 hover:bg-red-600"
      case "executed":
        return "bg-purple-500 hover:bg-purple-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  // Calculate voting percentages and time remaining
  const calculateVotingData = (proposal: Proposal) => {
    const totalVotes = proposal.yes_votes + proposal.no_votes;
    const yesPercentage = totalVotes > 0 ? Math.round((proposal.yes_votes / totalVotes) * 100) : 0;
    const noPercentage = totalVotes > 0 ? Math.round((proposal.no_votes / totalVotes) * 100) : 0;
    
    // Calculate time remaining
    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = proposal.voting_ends_at - currentTime;
    let timeRemainingStr = 'Ended';
    
    if (timeRemaining > 0) {
      const days = Math.floor(timeRemaining / 86400);
      const hours = Math.floor((timeRemaining % 86400) / 3600);
      
      if (days > 0) {
        timeRemainingStr = `${days}d ${hours}h`;
      } else {
        const minutes = Math.floor((timeRemaining % 3600) / 60);
        timeRemainingStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      }
    }
    
    return { yesPercentage, noPercentage, timeRemainingStr };
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-4">
          <Spinner className="h-6 w-6" />
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-center text-muted-foreground">No recent proposals</div>
      ) : (
        proposals.map((proposal) => {
          const { yesPercentage, noPercentage, timeRemainingStr } = calculateVotingData(proposal);
          const statusString = getStatusString(proposal.status.code);
          
          return (
            <Card key={proposal.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-xl truncate">{proposal.title}</CardTitle>
                  <Badge className={getStatusColor(statusString)}>
                    {statusString.charAt(0).toUpperCase() + statusString.slice(1)}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">{proposal.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>For: {yesPercentage}%</span>
                    <span>Against: {noPercentage}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${yesPercentage}%` }} />
                    </div>
                  </div>
                  {proposal.status.code === 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Ends in {timeRemainingStr}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="ml-auto gap-1" asChild>
                  <Link href={`/proposals/${proposal.id}`}>
                    View Details <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })
      )}
      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/proposals">View All Proposals</Link>
        </Button>
      </div>
    </div>
  )
}
