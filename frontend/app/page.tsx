import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ArrowRight } from "lucide-react"
import { ConnectWalletButton } from "@/components/connect-wallet-button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <div className="rounded-full bg-primary p-1 text-primary-foreground">
              <Users className="h-5 w-5" />
            </div>
            SuiDAO Governance
          </div>
          <ConnectWalletButton />
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Decentralized Governance on Sui
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Transparent decision-making, efficient treasury management, and community-led governance for your
                  projects on the Sui blockchain.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/dashboard">Launch Dashboard</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/docs">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Create a DAO</CardTitle>
                  <CardDescription>Deploy customizable DAOs with defined governance rules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Easy Setup</div>
                  <p className="text-xs text-muted-foreground">
                    Select from plug-and-play templates for common use cases
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1" asChild>
                    <Link href="/create">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Governance</CardTitle>
                  <CardDescription>Submit proposals and vote on decisions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Active Participation</div>
                  <p className="text-xs text-muted-foreground">Shape your DAO's direction through transparent voting</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1" asChild>
                    <Link href="/proposals">
                      View Proposals <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Treasury</CardTitle>
                  <CardDescription>Manage funds with configurable access controls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Secure Management</div>
                  <p className="text-xs text-muted-foreground">Transparent allocation of SUI tokens and other assets</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1" asChild>
                    <Link href="/treasury">
                      Explore Treasury <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Staking</CardTitle>
                  <CardDescription>Participate in validator selection and rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Earn Rewards</div>
                  <p className="text-xs text-muted-foreground">
                    Stake SUI tokens and participate in validator governance
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1" asChild>
                    <Link href="/staking">
                      Start Staking <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Built on Sui Blockchain</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Leveraging Sui's high throughput, low latency, and parallel transaction processing for scalable
                  governance.
                </p>
              </div>
              <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>High Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Up to 297,000 TPS to support large-scale voting and treasury transactions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Move Language</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Secure, modular, and composable governance logic with Move's type safety</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Gasless Voting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Off-chain voting signatures to reduce costs with on-chain finalization</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            © 2025 SuiDAO Governance. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground underline underline-offset-4">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
