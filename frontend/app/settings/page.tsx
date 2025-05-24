import { DashboardLayout } from "@/components/dashboard-layout"
import { SettingsForm } from "@/components/settings-form"
import { EmailNotificationTester } from "@/components/email-notification-tester"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <SettingsForm />
        <div className="mt-8">
          <h2 className="text-xl font-bold tracking-tight mb-4">Email Notification Testing</h2>
          <EmailNotificationTester />
        </div>
      </div>
    </DashboardLayout>
  )
}
