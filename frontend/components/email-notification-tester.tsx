"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"

export function EmailNotificationTester() {
  const [email, setEmail] = useState("")
  const [notificationType, setNotificationType] = useState("proposal_created")
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  async function subscribeToNotifications() {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          proposalCreated: true,
          proposalVoted: true,
          proposalExecuted: true,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Subscription successful",
          description: "You have been subscribed to email notifications",
        })
        setTestResults(prev => [...prev, `✅ Subscribed ${email} to notifications`])
      } else {
        toast({
          title: "Subscription failed",
          description: result.message || "Failed to subscribe to email notifications",
          variant: "destructive",
        })
        setTestResults(prev => [...prev, `❌ Failed to subscribe: ${result.message}`])
      }
    } catch (error) {
      console.error("Error subscribing to notifications:", error)
      toast({
        title: "Error",
        description: "Failed to subscribe to email notifications",
        variant: "destructive",
      })
      setTestResults(prev => [...prev, `❌ Error subscribing: ${error}`])
    } finally {
      setIsLoading(false)
    }
  }

  async function testNotification() {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: notificationType,
          email,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Test notification sent",
          description: "Check the console for the test notification",
        })
        setTestResults(prev => [...prev, `✅ Test ${notificationType} notification sent`])
      } else {
        toast({
          title: "Test failed",
          description: result.message || "Failed to send test notification",
          variant: "destructive",
        })
        setTestResults(prev => [...prev, `❌ Test failed: ${result.message}`])
      }
    } catch (error) {
      console.error("Error sending test notification:", error)
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive",
      })
      setTestResults(prev => [...prev, `❌ Error testing: ${error}`])
    } finally {
      setIsLoading(false)
    }
  }

  function clearResults() {
    setTestResults([])
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Email Notification Tester</CardTitle>
        <CardDescription>
          Test the email notification system for your DAO governance application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Notification Type</Label>
          <RadioGroup
            value={notificationType}
            onValueChange={setNotificationType}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="proposal_created" id="proposal_created" />
              <Label htmlFor="proposal_created">Proposal Created</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="proposal_voted" id="proposal_voted" />
              <Label htmlFor="proposal_voted">Proposal Voted</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="proposal_executed" id="proposal_executed" />
              <Label htmlFor="proposal_executed">Proposal Executed</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-2">
            <Button 
              onClick={subscribeToNotifications} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Processing..." : "1. Subscribe to Notifications"}
            </Button>
            <Button 
              onClick={testNotification} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Processing..." : "2. Test Notification"}
            </Button>
          </div>
          
          {testResults.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <Label>Test Results</Label>
                <Button variant="outline" size="sm" onClick={clearResults}>Clear</Button>
              </div>
              <div className="mt-2 p-4 bg-muted rounded-md h-40 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm py-1">{result}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
        <p>How to test email notifications:</p>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Enter your email address and click "Subscribe to Notifications"</li>
          <li>Select a notification type and click "Test Notification"</li>
          <li>Check the browser console (F12) to see the test notification logs</li>
        </ol>
        <p className="mt-2">Note: This is a test implementation that logs notifications to the console. In a production environment, you would integrate with an email service provider.</p>
      </CardFooter>
    </Card>
  )
}
