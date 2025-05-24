"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Clock, ArrowUpRight, ArrowDownRight, FileText, MessageSquare, Activity } from "lucide-react"
import { Proposal } from "@/lib/types"
import { daoGovernanceClient } from "@/lib/sui-client"
import { useCurrentDAO } from "@/hooks/useDAO"
import { useVoteOnProposal } from "@/hooks/useVoteOnProposal"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { ProposalVotes } from "@/components/proposal-votes"

// Define a type for our processed proposal data that matches the component's expectations
interface ProcessedProposal {
  id: string;
  title: string;
  description: string;
  status: string;
  author: { address: string };
  createdAt: string;
  endTime: string;
  votes: {
    for: number;
    against: number;
    total: number;
    quorum: number;
  };
  details?: {
    quorum: string;
    threshold: string;
    votingPeriod: string;
    implementation: string;
  };
  discussion?: Array<{
    author: { address: string; avatar?: string };
    timestamp: string;
    content: string;
  }>;
  votingActivity?: Array<{
    voter: string;
    timestamp: string;
    voteType: 'for' | 'against';
  }>;
}

export function ProposalDetail({ id }: { id: string }) {
  const [hasVoted, setHasVoted] = useState(false)
  const [proposal, setProposal] = useState<ProcessedProposal | null>(null)
  const [loading, setLoading] = useState(true)
  const { currentDAOId } = useCurrentDAO()

  // Function to retrieve a proposal from localStorage
  const getLocalProposal = (proposalId: string) => {
    if (typeof window === 'undefined') return null;
    
    // Try to find the proposal in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('proposal-')) {
        try {
          const storedData = JSON.parse(localStorage.getItem(key) || '{}');
          
          // Check if this is the proposal we're looking for
          if (storedData.id && storedData.id.toString() === proposalId) {
            return storedData;
          }
          
          // Also check if the key contains the ID (for older storage format)
          if (key.includes(proposalId)) {
            return storedData;
          }
        } catch (error) {
          console.error('Error parsing stored proposal:', error);
        }
      }
    }
    
    return null;
  };

  useEffect(() => {
    async function fetchProposal() {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // First try to get the proposal from the blockchain
        let blockchainProposal = null;
        if (currentDAOId) {
          try {
            // Get all proposals for the DAO
            const proposals = await daoGovernanceClient.getDAOProposals(currentDAOId);
            // Find the specific proposal by ID
            blockchainProposal = proposals.find(p => p.id.toString() === id);
            console.log('Found proposal from blockchain:', blockchainProposal);
          } catch (error) {
            console.error('Error fetching proposal from blockchain:', error);
          }
        }
        
        // If not found in blockchain, try localStorage
        const localProposal = getLocalProposal(id);
        
        // Use blockchain data if available, otherwise use local data
        const rawProposal = blockchainProposal || localProposal;
        
        if (rawProposal) {
          // Format the proposal data for the UI
          const processedProposal: ProcessedProposal = {
            id: rawProposal.id?.toString() || id,
            title: rawProposal.title || 
                  (rawProposal.proposalEvent?.parsedJson?.title) || 
                  'Untitled Proposal',
            description: rawProposal.description || 
                       (rawProposal.proposalEvent?.parsedJson?.description) || 
                       'No description provided',
            status: getStatusString(rawProposal.status?.code || 0),
            author: { 
              address: rawProposal.proposer || 'Unknown'
            },
            createdAt: formatDate(rawProposal.created_at || Math.floor(Date.now() / 1000)),
            endTime: formatTimeRemaining(rawProposal.voting_ends_at || (Math.floor(Date.now() / 1000) + 86400)),
            votes: {
              for: rawProposal.yes_votes ? calculatePercentage(rawProposal.yes_votes, rawProposal.yes_votes + rawProposal.no_votes) : 60,
              against: rawProposal.no_votes ? calculatePercentage(rawProposal.no_votes, rawProposal.yes_votes + rawProposal.no_votes) : 40,
              total: (rawProposal.yes_votes || 0) + (rawProposal.no_votes || 0) || 1000,
              quorum: 10 // Default quorum percentage
            },
            details: {
              quorum: '10%',
              threshold: '50%',
              votingPeriod: '3 days',
              implementation: 'Automatic'
            },
            // Sample discussion data
            discussion: [],
            // Sample voting activity
            votingActivity: []
          };
          
          setProposal(processedProposal);
        } else {
          console.error('Proposal not found:', id);
          setProposal(null);
        }
      } catch (error) {
        console.error('Error fetching proposal:', error);
        setProposal(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProposal();
  }, [id, currentDAOId]);
  
  // Helper function to get status string from code
  function getStatusString(statusCode: number): string {
    switch (statusCode) {
      case 0: return "active";
      case 1: return "passed";
      case 2: return "rejected";
      case 3: return "executed";
      default: return "pending";
    }
  }
  
  // Helper function to calculate percentage
  function calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }
  
  // Helper function to format date
  function formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // Helper function to format time remaining
  function formatTimeRemaining(endTimestamp: number): string {
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTimestamp - now;
    
    if (remaining <= 0) return 'Ended';
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  // Get the current wallet account
  const currentAccount = useCurrentAccount();
  
  // Get the vote on proposal mutation
  const { mutate: voteOnProposal, isPending: isVoting } = useVoteOnProposal();
  
  // Check if user has already voted (from localStorage)
  useEffect(() => {
    if (typeof window !== 'undefined' && currentAccount) {
      try {
        const voteKey = `vote-${currentDAOId}-${id}`;
        const storedVote = localStorage.getItem(voteKey);
        if (storedVote) {
          setHasVoted(true);
        }
      } catch (error) {
        console.error('Error checking vote in localStorage:', error);
      }
    }
  }, [currentAccount, currentDAOId, id]);

  // Handle vote action
  const handleVote = (vote: "for" | "against") => {
    // Check if wallet is connected
    if (!currentAccount) {
      toast.error('Please connect your wallet to vote');
      return;
    }
    
    // Check if DAO ID is available
    if (!currentDAOId) {
      toast.error('DAO ID not found. Please try again.');
      return;
    }
    
    // Convert the string ID to a number
    const proposalId = parseInt(id, 10);
    if (isNaN(proposalId)) {
      toast.error('Invalid proposal ID');
      return;
    }
    
    // Execute the vote transaction
    voteOnProposal(
      {
        daoId: currentDAOId,
        proposalId: proposalId,
        vote: vote === 'for' // true for 'for', false for 'against'
      },
      {
        onSuccess: () => {
          setHasVoted(true);
          
          // Update local storage to mark that the user has voted
          try {
            const voteKey = `vote-${currentDAOId}-${id}`;
            localStorage.setItem(voteKey, JSON.stringify({
              daoId: currentDAOId,
              proposalId: id,
              vote: vote === 'for',
              timestamp: Date.now()
            }));
          } catch (error) {
            console.error('Error saving vote to localStorage:', error);
          }
        }
      }
    );
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading proposal...</div>
  }

  if (!proposal) {
    return <div className="text-center text-muted-foreground">Proposal not found</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight break-words">{proposal.title}</h1>
          <Badge
            className={
              proposal.status === "active"
                ? "bg-blue-500 hover:bg-blue-600 whitespace-nowrap text-xs sm:text-sm"
                : proposal.status === "passed"
                  ? "bg-green-500 hover:bg-green-600 whitespace-nowrap text-xs sm:text-sm"
                  : "bg-red-500 hover:bg-red-600 whitespace-nowrap text-xs sm:text-sm"
            }
          >
            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
          <span className="break-all">Created by {proposal.author.address}</span>
          <span className="hidden sm:inline">•</span>
          <span>{proposal.createdAt}</span>
        </div>
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Proposal Details</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <p className="whitespace-pre-line text-sm sm:text-base">{proposal.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Voting</CardTitle>
          {proposal.status === "active" && (
            <CardDescription className="flex items-center gap-1 text-xs sm:text-sm">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="break-words">Ends in {proposal.endTime}</span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 flex-shrink-0" />
                  <span>For: {proposal.votes.for}%</span>
                </div>
                <span className="text-right">{Math.round((proposal.votes.total * proposal.votes.for) / 100).toLocaleString()} SUI</span>
              </div>
              <Progress value={proposal.votes.for} className="h-2 w-full bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 flex-shrink-0" />
                  <span>Against: {proposal.votes.against}%</span>
                </div>
                <span className="text-right">{Math.round((proposal.votes.total * proposal.votes.against) / 100).toLocaleString()} SUI</span>
              </div>
              <Progress value={proposal.votes.against} className="h-2 w-full bg-muted" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm gap-1">
              <span>Quorum: {proposal.votes.quorum}% required</span>
              <span>{proposal.votes.total.toLocaleString()} SUI voted</span>
            </div>
          </div>
        </CardContent>
        {proposal.status === "active" && (
          <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 px-4 sm:px-6">
            {!hasVoted ? (
              <>
                <Button
                  variant="outline"
                  className="w-full sm:flex-1 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 text-xs sm:text-sm"
                  onClick={() => handleVote("against")}
                  disabled={isVoting}
                >
                  {isVoting ? <>
                    <Spinner className="mr-2 h-4 w-4" /> Processing...
                  </> : "Vote Against"}
                </Button>
                <Button
                  className="w-full sm:flex-1 bg-emerald-600 text-white hover:bg-emerald-700 text-xs sm:text-sm mt-2 sm:mt-0"
                  onClick={() => handleVote("for")}
                  disabled={isVoting}
                >
                  {isVoting ? <>
                    <Spinner className="mr-2 h-4 w-4" /> Processing...
                  </> : "Vote For"}
                </Button>
              </>
            ) : (
              <div className="w-full text-center text-xs sm:text-sm text-muted-foreground">
                Thank you for voting! Your vote has been recorded.
              </div>
            )}
          </CardFooter>
        )}
      </Card>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="flex flex-wrap overflow-x-auto w-full">
          <TabsTrigger value="details" className="text-xs sm:text-sm">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Governance Details</span>
          </TabsTrigger>
          <TabsTrigger value="discussion" className="text-xs sm:text-sm">
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Discussion</span>
          </TabsTrigger>
          <TabsTrigger value="votes" className="text-xs sm:text-sm">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Votes</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">Governance Parameters</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <dl className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs sm:text-sm font-medium text-muted-foreground">Quorum</dt>
                  <dd className="text-xs sm:text-sm break-words">{proposal.details?.quorum || "Loading..."}</dd>
                </div>
                <div>
                  <dt className="text-xs sm:text-sm font-medium text-muted-foreground">Threshold</dt>
                  <dd className="text-xs sm:text-sm break-words">{proposal.details?.threshold || "Loading..."}</dd>
                </div>
                <div>
                  <dt className="text-xs sm:text-sm font-medium text-muted-foreground">Voting Period</dt>
                  <dd className="text-xs sm:text-sm break-words">{proposal.details?.votingPeriod || "Loading..."}</dd>
                </div>
                <div>
                  <dt className="text-xs sm:text-sm font-medium text-muted-foreground">Implementation</dt>
                  <dd className="text-xs sm:text-sm break-words">{proposal.details?.implementation || "Loading..."}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="discussion">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">Discussion</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Community discussion about this proposal</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-4">
                {!proposal.discussion || proposal.discussion.length === 0 ? (
                  <div className="text-center text-xs sm:text-sm text-muted-foreground">No discussion yet</div>
                ) : (
                  proposal.discussion.map((comment, index) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-3">
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback>{comment.author.address.slice(2, 4).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <p className="text-xs sm:text-sm font-medium break-all">{comment.author.address}</p>
                          <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                        </div>
                        <p className="text-xs sm:text-sm break-words">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="votes">
          {currentDAOId && id ? (
            <ProposalVotes daoId={currentDAOId} proposalId={id} />
          ) : (
            <Card>
              <CardContent className="px-4 sm:px-6 py-6">
                <div className="text-center text-xs sm:text-sm text-muted-foreground">
                  Unable to load voting data. DAO or proposal ID not found.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
