"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useCreateDAO } from "@/hooks/useDAO"
import { CreateDAOParams } from "@/lib/types"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { toast } from "sonner"

interface FormData {
  name: string
  description: string
  proposal_threshold: number
  voting_quorum: number
  voting_threshold: number
  voting_period: number
  timelock_period: number
  initial_treasury: number
}

export function CreateDaoForm() {
  const router = useRouter()
  const currentAccount = useCurrentAccount()
  const createDAOMutation = useCreateDAO()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    proposal_threshold: 10,
    voting_quorum: 30,
    voting_threshold: 50,
    voting_period: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    timelock_period: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
    initial_treasury: 0,
  })

  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentAccount) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!formData.name || !formData.description) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const params: CreateDAOParams = {
        name: formData.name,
        description: formData.description,
        proposal_threshold: formData.proposal_threshold,
        voting_quorum: formData.voting_quorum,
        voting_threshold: formData.voting_threshold,
        voting_period: formData.voting_period,
        timelock_period: formData.timelock_period,
        initial_treasury: formData.initial_treasury,
      }

      await createDAOMutation.mutateAsync(params)
      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating DAO:", error)
    }
  }

  const nextStep = () => setCurrentStep(currentStep + 1)
  const prevStep = () => setCurrentStep(currentStep - 1)

  const isSubmitting = createDAOMutation.isPending

  if (!currentAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet Required</CardTitle>
          <CardDescription>
            Please connect your Sui wallet to create a DAO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You need to connect a Sui wallet to interact with the blockchain and create your DAO.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              1
            </div>
            <div className={`h-1 w-8 ${currentStep >= 2 ? "bg-primary" : "bg-muted"}`} />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              2
            </div>
            <div className={`h-1 w-8 ${currentStep >= 3 ? "bg-primary" : "bg-muted"}`} />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              3
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Step {currentStep} of 3</div>
        </div>

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Set up the basic details for your DAO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dao-name">DAO Name *</Label>
                <Input 
                  id="dao-name" 
                  placeholder="Enter your DAO name" 
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dao-description">Description *</Label>
                <Textarea
                  id="dao-description"
                  placeholder="Describe the purpose and goals of your DAO"
                  className="min-h-32"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="initial-deposit">Initial Treasury Deposit (SUI)</Label>
                <Input 
                  id="initial-deposit" 
                  type="number" 
                  placeholder="0" 
                  min="0" 
                  step="0.1"
                  value={formData.initial_treasury}
                  onChange={(e) => updateFormData('initial_treasury', parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">Amount of SUI to deposit into the treasury initially</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="button" onClick={nextStep} disabled={!formData.name || !formData.description}>
                Next Step
              </Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Governance Parameters</CardTitle>
              <CardDescription>Define how proposals and voting will work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="proposal-threshold">Proposal Threshold (Voting Power)</Label>
                  <span className="text-sm">{formData.proposal_threshold}</span>
                </div>
                <Slider 
                  value={[formData.proposal_threshold]} 
                  onValueChange={(value) => updateFormData('proposal_threshold', value[0])}
                  max={100} 
                  step={1} 
                />
                <p className="text-xs text-muted-foreground">
                  Minimum voting power required to submit a proposal
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="voting-quorum">Voting Quorum (%)</Label>
                  <span className="text-sm">{formData.voting_quorum}%</span>
                </div>
                <Slider 
                  value={[formData.voting_quorum]} 
                  onValueChange={(value) => updateFormData('voting_quorum', value[0])}
                  max={100} 
                  step={1} 
                />
                <p className="text-xs text-muted-foreground">
                  Minimum percentage of total voting power that must participate
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="approval-threshold">Approval Threshold (%)</Label>
                  <span className="text-sm">{formData.voting_threshold}%</span>
                </div>
                <Slider 
                  value={[formData.voting_threshold]} 
                  onValueChange={(value) => updateFormData('voting_threshold', value[0])}
                  max={100} 
                  step={1} 
                />
                <p className="text-xs text-muted-foreground">Percentage of votes required for a proposal to pass</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="voting-period">Voting Period</Label>
                <Select 
                  value={String(formData.voting_period / (24 * 60 * 60 * 1000))}
                  onValueChange={(value) => updateFormData('voting_period', parseInt(value) * 24 * 60 * 60 * 1000)}
                >
                  <SelectTrigger id="voting-period">
                    <SelectValue placeholder="Select voting period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="5">5 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timelock-period">Timelock Period</Label>
                <Select 
                  value={String(formData.timelock_period / (60 * 60 * 1000))}
                  onValueChange={(value) => updateFormData('timelock_period', parseInt(value) * 60 * 60 * 1000)}
                >
                  <SelectTrigger id="timelock-period">
                    <SelectValue placeholder="Select timelock period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Delay between proposal passing and execution
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button type="button" onClick={nextStep}>
                Next Step
              </Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Create</CardTitle>
              <CardDescription>Review your DAO configuration and create it on the Sui blockchain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">DAO Name</Label>
                    <p className="text-sm text-muted-foreground">{formData.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Initial Treasury</Label>
                    <p className="text-sm text-muted-foreground">{formData.initial_treasury} SUI</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Proposal Threshold</Label>
                    <p className="text-sm text-muted-foreground">{formData.proposal_threshold} voting power</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Voting Quorum</Label>
                    <p className="text-sm text-muted-foreground">{formData.voting_quorum}%</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Approval Threshold</Label>
                    <p className="text-sm text-muted-foreground">{formData.voting_threshold}%</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Voting Period</Label>
                    <p className="text-sm text-muted-foreground">{formData.voting_period / (24 * 60 * 60 * 1000)} days</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">{formData.description}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating DAO..." : "Create DAO"}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </form>
  )
}
