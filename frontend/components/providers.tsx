"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider, createNetworkConfig, SuiClientProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { SUI_CONFIG } from '@/lib/sui-config';
import { useState } from 'react';

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
  localnet: { url: getFullnodeUrl('localnet') },
  devnet: { url: getFullnodeUrl('devnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider>
          <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster 
              position="top-right"
              expand={false}
              richColors
              closeButton
            />
          </NextThemesProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
} 