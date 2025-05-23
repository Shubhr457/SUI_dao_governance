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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { FileText, Code, DollarSign } from "lucide-react"

export function CreateProposalForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [proposalType, setProposalType] = useState("text")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate proposal creation
    setTimeout(() => {
      setIsSubmitting(false)
      router.push("/proposals")
    }, 2000)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Proposal Information</CardTitle>
            <CardDescription>Provide the basic details for your proposal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Enter a clear, descriptive title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of your proposal"
                className="min-h-32"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select defaultValue="governance">
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
                  <Input id="discussion-url" placeholder="Link to forum discussion" />
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
                  <Input id="module-name" placeholder="e.g., governance, treasury" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code-changes">Code Changes</Label>
                  <Textarea
                    id="code-changes"
                    placeholder="Paste your Move code here"
                    className="min-h-32 font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code-description">Technical Description</Label>
                  <Textarea
                    id="code-description"
                    placeholder="Explain the technical changes and their impact"
                    className="min-h-24"
                    required
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
                  <Input id="amount" type="number" placeholder="0" min="0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input id="recipient" placeholder="0x..." required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Select defaultValue="development">
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
              <Select defaultValue="7">
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
                <span className="text-sm">30%</span>
              </div>
              <Slider defaultValue={[30]} max={100} step={1} />
              <p className="text-xs text-muted-foreground">
                Minimum percentage of total voting power that must participate for the vote to be valid
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="immediate-execution" />
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
      </div>
    </form>
  )
}
