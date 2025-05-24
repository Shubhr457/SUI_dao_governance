"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { FileText, Code, DollarSign } from "lucide-react"
import { useCreateProposal, useSharedDAOs, useCurrentDAO, useRegisterMember, useDAOMembership } from "@/hooks/useDAO"
import { CreateProposalParams } from "@/lib/types"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { toast } from "sonner"
import Link from "next/link"
import { AlertCircle, CheckCircle } from "lucide-react"
import { suiToMist } from "@/lib/sui-client"
import { SUI_CONFIG } from "@/lib/sui-config"

interface FormData {
  title: string
  description: string
  proposalType: string
  treasuryAmount: number
  recipientAddress: string
  discussionUrl: string
  moduleName: string
  codeChanges: string
  codeDescription: string
  purpose: string
  milestones: string
  votingPeriod: number
  quorum: number
  immediateExecution: boolean
  parameterKey?: string
  parameterValue?: string
  validatorAddress?: string
}

export function CreateProposalForm() {
  const router = useRouter()
  const currentAccount = useCurrentAccount()
  const createProposalMutation = useCreateProposal()
  const { data: sharedDAOs, isLoading: isLoadingDAOs } = useSharedDAOs()
  const { currentDAOId, currentDAOName, hasDAO } = useCurrentDAO()
  const registerMemberMutation = useRegisterMember()
  
  // Force re-render when localStorage changes
  const [refreshKey, setRefreshKey] = useState(0)
  const [isMember, setIsMember] = useState(false)
  const [votingPower, setVotingPower] = useState(0)
  const [isCheckingMembership, setIsCheckingMembership] = useState(false)
  
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1)
    }
    
    window.addEventListener('storage', handleStorageChange)
    // Also listen for manual triggers
    window.addEventListener('dao-created', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('dao-created', handleStorageChange)
    }
  }, [])
  
  // Use the membership hook to check if user is a member
  const { data: membershipData, isLoading: isCheckingMembershipData } = useDAOMembership(currentDAOId)
  
  // Update local state when membership data changes
  useEffect(() => {
    if (membershipData) {
      setIsMember(membershipData.isMember)
      setVotingPower(membershipData.votingPower)
      setIsCheckingMembership(false)
    } else {
      setIsCheckingMembership(isCheckingMembershipData)
    }
  }, [membershipData, isCheckingMembershipData])
  
  const handleRegisterMember = async () => {
    if (!currentDAOId || !currentAccount?.address) {
      toast.error('No DAO found or wallet not connected')
      return
    }
    
    try {
      const votingPowerAmount = 100 // Default voting power
      
      // Pass the current address to the mutation so it can be used in the onSuccess callback
      await registerMemberMutation.mutateAsync({
        daoId: currentDAOId,
        votingPower: votingPowerAmount,
        sender: currentAccount.address // Add sender address to be used in onSuccess
      })
      
      // Update local state
      setIsMember(true)
      setVotingPower(votingPowerAmount)
      
      // Store membership info directly in localStorage as a backup
      const storageKey = `dao-membership-${currentDAOId}-${currentAccount.address}`
      localStorage.setItem(storageKey, JSON.stringify({ isMember: true, votingPower: votingPowerAmount }))
      
      // Manually trigger a refresh of the membership data
      setTimeout(() => {
        // This will cause the useDAOMembership hook to refetch
        window.dispatchEvent(new Event('storage'))
      }, 500)
      
      toast.success('Successfully registered as DAO member!')
    } catch (error) {
      console.error('Error registering as member:', error)
      toast.error('Failed to register as member. Please try again.')
    }
  }
  
  const [proposalType, setProposalType] = useState("text")
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    proposalType: "text",
    treasuryAmount: 0,
    recipientAddress: "",
    discussionUrl: "",
    moduleName: "",
    codeChanges: "",
    codeDescription: "",
    purpose: "development",
    milestones: "",
    votingPeriod: 7,
    quorum: 30,
    immediateExecution: false,
  })

  const updateFormData = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getProposalTypeCode = (type: string): number => {
    switch (type) {
      case "text": return 0
      case "treasury": return 1
      case "code": return 2
      default: return 0
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hasDAO || !currentDAOId) {
      toast.error('No DAO found. Please create a DAO first.')
      return
    }

    if (!isMember) {
      toast.error('You must be a DAO member to create proposals. Please register as a member first.')
      return
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.proposalType === 'treasury') {
      if (!formData.treasuryAmount || formData.treasuryAmount <= 0) {
        toast.error('Please enter a valid treasury amount')
        return
      }
      if (!formData.recipientAddress?.trim()) {
        toast.error('Please enter a recipient address')
        return
      }
    }

    if (formData.proposalType === 'code') {
      if (!formData.parameterKey?.trim()) {
        toast.error('Please enter a parameter key')
        return
      }
      if (!formData.parameterValue?.trim()) {
        toast.error('Please enter a parameter value')
        return
      }
    }

    try {
      console.log('Creating proposal for DAO:', currentDAOId)
      console.log('Proposal data:', formData)

      // Normalize the DAO ID to ensure consistent format
      const normalizedDAOId = currentDAOId.toLowerCase()
      console.log('Normalized DAO ID:', normalizedDAOId)

      const proposalParams: CreateProposalParams = {
        title: formData.title,
        description: formData.description,
        proposal_type: getProposalTypeCode(formData.proposalType),
        treasury_transfer_amount: formData.proposalType === 'treasury' ? 
          suiToMist(formData.treasuryAmount || 0) : 0,
        treasury_transfer_recipient: formData.proposalType === 'treasury' ? 
          formData.recipientAddress : undefined,
        parameter_key: formData.proposalType === 'code' ? 
          formData.parameterKey : undefined,
        parameter_value: formData.proposalType === 'code' ? 
          parseInt(formData.parameterValue || '0') : undefined,
        validator_address: formData.proposalType === 'validator' ? 
          formData.validatorAddress : undefined,
      }

      console.log('Final proposal parameters:', proposalParams)
      console.log('Using clock ID:', SUI_CONFIG.CLOCK_ID)

      // Add a small delay to ensure blockchain state is updated
      const result = await createProposalMutation.mutateAsync({
        daoId: normalizedDAOId, // Use normalized ID
        params: proposalParams,
        clockId: SUI_CONFIG.CLOCK_ID,
      })
      
      console.log('Proposal creation result:', result)
      
      // Extract and log event details
      // Type check and safely access result properties
      if (result && typeof result === 'object' && 'events' in result && Array.isArray(result.events) && result.events.length > 0) {
        console.log('Proposal creation events:', result.events)
        
        // Log all event types for debugging
        result.events.forEach((event: any, index: number) => {
          if (event && typeof event === 'object') {
            console.log(`Event ${index} type:`, event.type)
            console.log(`Event ${index} data:`, event)
          }
        })
        
        // Look for any event that might be related to proposal creation
        // Try to match by any part of the event type name
        const proposalEvent = result.events.find((event: any) => 
          event && typeof event === 'object' && 'type' in event && 
          typeof event.type === 'string' && (
            event.type.includes('Proposal') ||
            event.type.includes('proposal') ||
            event.type.includes('dao_governance') ||
            event.type.includes('DAO')
          )
        )
        
        if (proposalEvent) {
          console.log('Potential proposal event found:', proposalEvent)
          
          // Check if event has parsedJson and try to extract proposal information
          if (proposalEvent && 'parsedJson' in proposalEvent) {
            console.log('Proposal event data:', proposalEvent.parsedJson)
            
            // Create a proposal object from this event data
            const eventData = proposalEvent.parsedJson
            const proposalId = eventData?.proposal_id || eventData?.proposalId || Date.now()
            
            // Store the proposal information in localStorage
            const proposalData = {
              daoId: normalizedDAOId,
              proposalEvent: proposalEvent,
              title: formData.title,
              description: formData.description,
              proposal_type: getProposalTypeCode(formData.proposalType),
              timestamp: Date.now(),
              proposalParams: proposalParams
            }
            
            // Create a unique key for this proposal
            const proposalKey = `proposal-${normalizedDAOId}-${proposalId}`
            localStorage.setItem(proposalKey, JSON.stringify(proposalData))
            console.log(`Saved proposal data to localStorage with key: ${proposalKey}`)
          }
        } else {
          console.log('No relevant proposal event found in transaction events')
          
          // Even if we don't find a specific event, still save the proposal data
          // as a fallback mechanism
          const fallbackProposalId = Date.now()
          const proposalData = {
            daoId: normalizedDAOId,
            title: formData.title,
            description: formData.description,
            proposal_type: getProposalTypeCode(formData.proposalType),
            timestamp: Date.now(),
            proposalParams: proposalParams
          }
          
          const proposalKey = `proposal-${normalizedDAOId}-${fallbackProposalId}`
          localStorage.setItem(proposalKey, JSON.stringify(proposalData))
          console.log(`Saved fallback proposal data to localStorage with key: ${proposalKey}`)
        }
      } else {
        console.log('No events found in transaction result')
        
        // If no events at all, still save the proposal data
        const fallbackProposalId = Date.now()
        const proposalData = {
          daoId: normalizedDAOId,
          title: formData.title,
          description: formData.description,
          proposal_type: getProposalTypeCode(formData.proposalType),
          timestamp: Date.now(),
          proposalParams: proposalParams
        }
        
        const proposalKey = `proposal-${normalizedDAOId}-${fallbackProposalId}`
        localStorage.setItem(proposalKey, JSON.stringify(proposalData))
        console.log(`Saved fallback proposal data to localStorage with key: ${proposalKey}`)
      }

      setFormData({
        title: '',
        description: '',
        proposalType: 'text',
        treasuryAmount: 0,
        recipientAddress: '',
        parameterKey: '',
        parameterValue: '',
        validatorAddress: '',
        discussionUrl: '',
        moduleName: '',
        codeChanges: '',
        codeDescription: '',
        purpose: 'development',
        milestones: '',
        votingPeriod: 7,
        quorum: 30,
        immediateExecution: false,
      })

      toast.success('Proposal created successfully!')
    } catch (error) {
      console.error('Error creating proposal:', error)
      toast.error('Failed to create proposal. Please try again.')
    }
  }

  const isSubmitting = createProposalMutation.isPending

  if (!hasDAO) {
    return (
      <div className="max-w-2xl mx-auto p-3 sm:p-6">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">No DAO Found</span>
          </div>
          <p className="text-gray-300 text-xs sm:text-sm">
            You need to create a DAO first before you can create proposals. 
            Please go to the <Link href="/create" className="text-blue-400 hover:underline">Create DAO</Link> page first.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-6">
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 text-green-400 mb-2">
          <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5" />
          <span className="font-medium text-sm sm:text-base">DAO Connected</span>
        </div>
        <p className="text-gray-300 text-xs sm:text-sm break-words">
          Creating proposal for: <span className="text-white font-medium">{currentDAOName || 'Unknown DAO'}</span>
        </p>
        <p className="text-gray-400 text-xs mt-1 break-all">
          DAO ID: {currentDAOId?.substring(0, 6)}...{currentDAOId?.substring(currentDAOId.length - 6)}
        </p>
      </div>

      {/* Member Registration Check */}
      {!isMember && !isCheckingMembership && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5" />
            <span className="font-medium text-sm sm:text-base">Member Registration Required</span>
          </div>
          <p className="text-gray-300 text-xs sm:text-sm mb-3">
            You need to register as a DAO member before you can create proposals. 
            This will give you voting power in the DAO.
          </p>
          <Button 
            onClick={handleRegisterMember} 
            disabled={registerMemberMutation.isPending}
            className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-xs sm:text-sm py-2"
          >
            {registerMemberMutation.isPending ? 'Registering...' : 'Register as Member'}
          </Button>
        </div>
      )}
      
      {isCheckingMembership && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 text-blue-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="font-medium text-sm sm:text-base">Checking membership...</span>
          </div>
        </div>
      )}

      {isMember && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5" />
            <span className="font-medium text-sm sm:text-base">Member Status: Active</span>
          </div>
          <p className="text-gray-300 text-xs sm:text-sm">
            Voting Power: <span className="text-white font-medium">{votingPower}</span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Disable form if not a member */}
        <fieldset disabled={!isMember}>
          <Card>
            <CardHeader>
              <CardTitle>Proposal Information</CardTitle>
              <CardDescription>Provide the basic details for your proposal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter a clear, descriptive title" required value={formData.title} onChange={(e) => updateFormData("title", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of your proposal"
                  className="min-h-32"
                  required
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue="governance" value={formData.proposalType} onValueChange={(value) => {
                  setProposalType(value)
                  updateFormData("proposalType", value)
                }}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="governance">Governance</SelectItem>
                    <SelectItem value="treasury">Treasury</SelectItem>
                    <SelectItem value="staking">Staking</SelectItem>
                    <SelectItem value="protocol">Protocol</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Tabs value={proposalType} onValueChange={setProposalType} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Text
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Code
              </TabsTrigger>
              <TabsTrigger value="treasury" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Treasury
              </TabsTrigger>
            </TabsList>
            <TabsContent value="text">
              <Card>
                <CardHeader>
                  <CardTitle>Text Proposal</CardTitle>
                  <CardDescription>Create a simple text-based proposal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="discussion-url">Discussion URL (Optional)</Label>
                    <Input id="discussion-url" placeholder="Link to forum discussion" value={formData.discussionUrl} onChange={(e) => updateFormData("discussionUrl", e.target.value)} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="code">
              <Card>
                <CardHeader>
                  <CardTitle>Code Proposal</CardTitle>
                  <CardDescription>Propose changes to the DAO's smart contract</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="module-name">Module Name</Label>
                    <Input id="module-name" placeholder="e.g., governance, treasury" required value={formData.moduleName} onChange={(e) => updateFormData("moduleName", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code-changes">Code Changes</Label>
                    <Textarea
                      id="code-changes"
                      placeholder="Paste your Move code here"
                      className="min-h-32 font-mono"
                      required
                      value={formData.codeChanges}
                      onChange={(e) => updateFormData("codeChanges", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code-description">Technical Description</Label>
                    <Textarea
                      id="code-description"
                      placeholder="Explain the technical changes and their impact"
                      className="min-h-24"
                      required
                      value={formData.codeDescription}
                      onChange={(e) => updateFormData("codeDescription", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="treasury">
              <Card>
                <CardHeader>
                  <CardTitle>Treasury Proposal</CardTitle>
                  <CardDescription>Propose treasury fund allocation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (SUI)</Label>
                    <Input id="amount" type="number" placeholder="0" min="0" required value={formData.treasuryAmount} onChange={(e) => updateFormData("treasuryAmount", Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient Address</Label>
                    <Input id="recipient" placeholder="0x..." required value={formData.recipientAddress} onChange={(e) => updateFormData("recipientAddress", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Select defaultValue="development" value={formData.purpose} onValueChange={(value) => updateFormData("purpose", value)}>
                      <SelectTrigger id="purpose">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="milestones">Milestones</Label>
                    <Textarea
                      id="milestones"
                      placeholder="List the milestones and deliverables for this funding"
                      className="min-h-24"
                      required
                      value={formData.milestones}
                      onChange={(e) => updateFormData("milestones", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Voting Parameters</CardTitle>
              <CardDescription>Configure how voting will work for this proposal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voting-period">Voting Period (Days)</Label>
                <Select 
                  defaultValue="7" 
                  value={String(formData.votingPeriod)} 
                  onValueChange={(value) => updateFormData("votingPeriod", Number(value))}
                >
                  <SelectTrigger id="voting-period">
                    <SelectValue placeholder="Select voting period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="5">5 days</SelectItem>
                    <SelectItem value="7">7 days (Default)</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="quorum">Quorum (%)</Label>
                  <span className="text-sm">{formData.quorum}%</span>
                </div>
                <Slider 
                  defaultValue={[30]} 
                  max={100} 
                  step={1} 
                  value={[formData.quorum]} 
                  onValueChange={(value) => updateFormData("quorum", value[0])} 
                />
                <p className="text-xs text-muted-foreground">
                  Minimum percentage of total voting power that must participate for the vote to be valid
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="immediate-execution" checked={formData.immediateExecution} onCheckedChange={(value) => updateFormData("immediateExecution", value)} />
                <Label htmlFor="immediate-execution">Enable immediate execution if passed</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Proposal"}
              </Button>
            </CardFooter>
          </Card>
        </fieldset>
      </form>
    </div>
  )
}
