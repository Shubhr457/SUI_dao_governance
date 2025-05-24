"use client"

import { Button } from "@/components/ui/button"
import { Wallet, LogOut, Copy, ExternalLink } from "lucide-react"
import { 
  useConnectWallet, 
  useDisconnectWallet, 
  useCurrentAccount, 
  useCurrentWallet,
  useWallets 
} from '@mysten/dapp-kit'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useState } from "react"

export function ConnectWalletButton() {
  const { mutate: connect } = useConnectWallet()
  const { mutate: disconnect } = useDisconnectWallet()
  const currentAccount = useCurrentAccount()
  const currentWallet = useCurrentWallet()
  const wallets = useWallets()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleConnect = async (walletName: string) => {
    try {
      const wallet = wallets.find(w => w.name === walletName)
      if (wallet) {
        connect(
          { wallet },
          {
            onSuccess: () => {
              setIsDialogOpen(false)
              toast.success('Wallet connected successfully!')
            },
            onError: (error) => {
              console.error('Failed to connect wallet:', error)
              toast.error('Failed to connect wallet. Please try again.')
            }
          }
        )
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      toast.error('Failed to connect wallet. Please try again.')
    }
  }

  const handleDisconnect = async () => {
    try {
      disconnect(undefined, {
        onSuccess: () => {
          toast.success('Wallet disconnected')
        },
        onError: (error) => {
          console.error('Failed to disconnect wallet:', error)
          toast.error('Failed to disconnect wallet')
        }
      })
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      toast.error('Failed to disconnect wallet')
    }
  }

  const copyAddress = () => {
    if (currentAccount?.address) {
      navigator.clipboard.writeText(currentAccount.address)
      toast.success('Address copied to clipboard')
    }
  }

  const openExplorer = () => {
    if (currentAccount?.address) {
      const explorerUrl = `https://suiexplorer.com/address/${currentAccount.address}?network=testnet`
      window.open(explorerUrl, '_blank')
    }
  }

  if (currentAccount) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 h-8 sm:h-10 text-xs sm:text-sm">
            <Wallet className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden xs:inline">{currentAccount.address.substring(0, 6)}...{currentAccount.address.substring(currentAccount.address.length - 4)}</span>
            <span className="xs:hidden">{currentAccount.address.substring(0, 4)}...</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 sm:w-64">
          <div className="px-2 py-2">
            <p className="text-xs sm:text-sm font-medium">Connected Wallet</p>
            <p className="text-xs text-muted-foreground break-all">
              {currentWallet && typeof currentWallet === 'object' && 'name' in currentWallet ? 
                String(currentWallet.name) : 'Connected'}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress} className="flex items-center gap-2 text-xs sm:text-sm">
            <Copy className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openExplorer} className="flex items-center gap-2 text-xs sm:text-sm">
            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            View on Explorer
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDisconnect} className="flex items-center gap-2 text-red-600 text-xs sm:text-sm">
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-1 sm:gap-2 h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm">
          <Wallet className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="whitespace-nowrap">Connect Wallet</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Connect Wallet</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Connect your Sui wallet to interact with the DAO governance platform
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
          {wallets.length > 0 ? (
            wallets.map((wallet) => (
              <Card 
                key={wallet.name} 
                className="cursor-pointer hover:bg-muted transition-colors" 
                onClick={() => handleConnect(wallet.name)}
              >
                <CardContent className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
                  <div className="rounded-full bg-primary/10 p-1 sm:p-2">
                    <Wallet className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xs sm:text-sm">{wallet.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Click to connect
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-4 sm:py-8">
              <p className="text-xs sm:text-sm text-muted-foreground">
                No Sui wallets detected. Please install a Sui wallet extension.
              </p>
              <Button 
                variant="link" 
                className="mt-2 text-xs sm:text-sm"
                onClick={() => window.open('https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil', '_blank')}
              >
                Install Sui Wallet
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
