# SUI DAO Governance Frontend

A decentralized autonomous organization (DAO) governance platform built on the Sui blockchain. This frontend application allows users to create DAOs, manage proposals, vote on governance decisions, and stake tokens.

## Features

- **DAO Creation**: Create new DAOs with customizable governance parameters
- **Proposal Management**: Create, vote on, and execute proposals
- **Treasury Management**: Manage DAO funds and treasury operations
- **Validator Staking**: Stake SUI tokens on validators through the DAO
- **Member Management**: Register as DAO members with voting power
- **Real-time Updates**: Live updates of DAO state and proposal statuses

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Blockchain**: Sui Network
- **Wallet Integration**: Sui Wallet, Ethos Wallet (via @mysten/dapp-kit)
- **UI Components**: Radix UI with Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS with custom components

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Sui wallet extension (Sui Wallet or Ethos Wallet)
- Access to Sui testnet for testing

## Installation

1. **Install dependencies**:
   ```bash
   npm install @mysten/dapp-kit @mysten/sui.js @tanstack/react-query
   ```

   Or if you want to replace the entire package.json:
   ```bash
   cp package-updated.json package.json
   npm install
   ```

2. **Update the package ID** in `lib/sui-config.ts`:
   ```typescript
   export const SUI_CONFIG = {
     PACKAGE_ID: '0x29a6132ed3245db42adac3bbb86fe38ed7d4677585546aaa9a70294f3e1fa05b',
     NETWORK: 'testnet', // Change to 'mainnet' for production
     RPC_URL: 'https://fullnode.testnet.sui.io:443',
   };
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Project Structure

```
frontend/
├── app/                    # Next.js app router pages
│   ├── create/            # DAO creation page
│   ├── dashboard/         # Dashboard page
│   ├── proposals/         # Proposals management
│   ├── staking/           # Staking interface
│   └── treasury/          # Treasury management
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── create-dao-form.tsx
│   ├── connect-wallet-button.tsx
│   └── ...
├── lib/                  # Utility libraries
│   ├── sui-config.ts     # Sui blockchain configuration
│   ├── sui-client.ts     # Sui client and transaction builders
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # General utilities
└── hooks/               # Custom React hooks
    └── useDAO.ts        # DAO-related hooks
```

## Smart Contract Integration

The frontend integrates with the DAO governance smart contract deployed at:
**Package ID**: `0x29a6132ed3245db42adac3bbb86fe38ed7d4677585546aaa9a70294f3e1fa05b`

### Key Functions Integrated:

- `create_dao`: Create a new DAO
- `register_member`: Register as a DAO member
- `create_proposal`: Create governance proposals
- `vote_on_proposal`: Vote on active proposals
- `process_proposal`: Process proposal results
- `execute_proposal`: Execute passed proposals
- `stake_on_validator`: Stake on validators
- `fund_treasury`: Add funds to DAO treasury

## Usage Guide

### 1. Connect Wallet
- Click "Connect Wallet" button
- Select your Sui wallet (Sui Wallet or Ethos Wallet)
- Approve the connection

### 2. Create a DAO
- Navigate to `/create`
- Fill in DAO details (name, description, governance parameters)
- Set initial treasury amount (optional)
- Review and submit the transaction
- Wait for transaction confirmation

### 3. Manage Proposals
- Go to `/proposals` to view all proposals
- Create new proposals (treasury transfers, parameter changes, validator management)
- Vote on active proposals
- Execute passed proposals after timelock period

### 4. Treasury Management
- View treasury balance and transaction history at `/treasury`
- Fund the treasury with additional SUI
- Monitor spending and transfers

### 5. Staking
- Access staking interface at `/staking`
- Stake SUI on approved validators
- Claim staking rewards
- Monitor staking performance

## Configuration

### Network Configuration
Update `lib/sui-config.ts` to change networks:

```typescript
export const SUI_CONFIG = {
  PACKAGE_ID: 'YOUR_PACKAGE_ID',
  NETWORK: 'testnet', // 'testnet', 'mainnet', 'devnet', 'localnet'
  RPC_URL: 'https://fullnode.testnet.sui.io:443',
};
```

### Contract Addresses
All contract addresses and object types are defined in `lib/sui-config.ts`. Update these if you deploy to a different address.

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure you have a Sui wallet extension installed
   - Check that the wallet is unlocked
   - Try refreshing the page

2. **Transaction Failed**
   - Check that you have sufficient SUI for gas fees
   - Verify the contract is deployed on the correct network
   - Check the browser console for detailed error messages

3. **Package Not Found**
   - Verify the PACKAGE_ID in `sui-config.ts` is correct
   - Ensure you're connected to the right network

### Getting Help

- Check the browser console for error messages
- Verify wallet connection and network settings
- Ensure contract is properly deployed and accessible

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 