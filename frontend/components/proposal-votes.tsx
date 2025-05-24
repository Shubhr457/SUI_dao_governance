import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { daoGovernanceClient } from "@/lib/sui-client"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { formatAddress } from "@/lib/utils"

// Interface for vote data
interface VoteData {
  voter: string
  vote: boolean // true for "for", false for "against"
  timestamp: number
  transactionDigest?: string
}

interface ProposalVotesProps {
  daoId: string
  proposalId: string
}

export function ProposalVotes({ daoId, proposalId }: ProposalVotesProps) {
  const [votes, setVotes] = useState<VoteData[]>([])
  const [loading, setLoading] = useState(true)
  const currentAccount = useCurrentAccount()

  // Fetch votes from blockchain and localStorage
  useEffect(() => {
    const fetchVotes = async () => {
      setLoading(true)
      try {
        // First, try to get votes from the blockchain
        const blockchainVotes = await fetchBlockchainVotes(daoId, proposalId)
        
        // Then, get any votes from localStorage (as a fallback)
        const localVotes = getLocalStorageVotes(daoId, proposalId)
        
        // Combine votes, removing duplicates (prefer blockchain data)
        const voterAddresses = new Set()
        const combinedVotes: VoteData[] = []
        
        // Add blockchain votes first
        blockchainVotes.forEach(vote => {
          voterAddresses.add(vote.voter)
          combinedVotes.push(vote)
        })
        
        // Add localStorage votes if they don't exist in blockchain data
        localVotes.forEach(vote => {
          if (!voterAddresses.has(vote.voter)) {
            combinedVotes.push(vote)
          }
        })
        
        // Sort votes by timestamp (newest first)
        combinedVotes.sort((a, b) => b.timestamp - a.timestamp)
        
        setVotes(combinedVotes)
      } catch (error) {
        console.error("Error fetching votes:", error)
        // If blockchain fetch fails, fall back to localStorage only
        const localVotes = getLocalStorageVotes(daoId, proposalId)
        setVotes(localVotes)
      } finally {
        setLoading(false)
      }
    }
    
    if (daoId && proposalId) {
      fetchVotes()
    }
  }, [daoId, proposalId, currentAccount])

  // Function to fetch votes from the blockchain
  const fetchBlockchainVotes = async (daoId: string, proposalId: string): Promise<VoteData[]> => {
    try {
      // Convert proposalId to number
      const proposalIdNum = parseInt(proposalId, 10)
      if (isNaN(proposalIdNum)) {
        throw new Error("Invalid proposal ID")
      }
      
      // Get proposal details including votes
      const proposals = await daoGovernanceClient.getDAOProposals(daoId)
      const proposal = proposals.find(p => p.id.toString() === proposalId)
      
      if (!proposal) {
        return []
      }
      
      // Extract votes from proposal data
      // Note: This is a placeholder - actual implementation depends on how votes are stored in the blockchain
      // You'll need to adapt this based on the actual data structure returned by the blockchain
      const votes: VoteData[] = []
      
      // Check if proposal has voters data
      if (proposal.voters && Array.isArray(proposal.voters)) {
        proposal.voters.forEach((voter: any) => {
          votes.push({
            voter: voter.address || voter.id || 'Unknown',
            vote: voter.voteType === 'for', // Assuming voteType is 'for' or 'against'
            timestamp: voter.timestamp || Date.now(),
            transactionDigest: voter.transactionDigest
          })
        })
      }
      
      return votes
    } catch (error) {
      console.error("Error fetching blockchain votes:", error)
      return []
    }
  }

  // Function to get votes from localStorage
  const getLocalStorageVotes = (daoId: string, proposalId: string): VoteData[] => {
    if (typeof window === 'undefined') {
      return []
    }
    
    try {
      const votes: VoteData[] = []
      
      // Scan localStorage for vote entries
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        
        // Check if this is a vote entry for our proposal
        if (key && key.startsWith(`vote-${daoId}-${proposalId}`)) {
          try {
            const voteData = JSON.parse(localStorage.getItem(key) || '{}')
            
            // Check if this is a valid vote entry
            if (voteData.daoId === daoId && voteData.proposalId === proposalId) {
              // Get the transaction digest if available
              const txKey = `vote-tx-${daoId}-${proposalId}`
              const transactionDigest = localStorage.getItem(txKey) || undefined
              
              votes.push({
                voter: voteData.voter || currentAccount?.address || 'Unknown',
                vote: voteData.vote,
                timestamp: voteData.timestamp || Date.now(),
                transactionDigest
              })
            }
          } catch (error) {
            console.error("Error parsing vote data from localStorage:", error)
          }
        }
      }
      
      return votes
    } catch (error) {
      console.error("Error reading votes from localStorage:", error)
      return []
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Votes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner className="h-6 w-6" />
          </div>
        ) : votes.length > 0 ? (
          <div className="space-y-4">
            {votes.map((vote, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{vote.voter.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{formatAddress(vote.voter)}</p>
                    {vote.transactionDigest && (
                      <a 
                        href={`https://explorer.sui.io/txblock/${vote.transactionDigest}?network=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        View Transaction
                      </a>
                    )}
                  </div>
                </div>
                <Badge variant={vote.vote ? "default" : "destructive"} className={vote.vote ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
                  {vote.vote ? "For" : "Against"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-6">
            No votes recorded yet.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
