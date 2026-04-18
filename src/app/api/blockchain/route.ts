import { NextRequest, NextResponse } from "next/server";
import { AuthMiddleware, AuthenticatedRequest } from "@/lib/auth-middleware";
import { blockchainEngine } from "@/lib/blockchain-engine";

export async function GET(request: NextRequest) {
  return AuthMiddleware.requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action');

      switch (action) {
        case 'portfolio':
          // Get user's NFT portfolio
          const wallet = blockchainEngine.getConnectedWallet();
          if (!wallet) {
            return NextResponse.json({ error: "No wallet connected" }, { status: 400 });
          }

          const nfts = blockchainEngine.getNFTsByOwner(wallet.address);
          return NextResponse.json({ nfts });

        case 'transactions':
          // Get user's transaction history
          const wallet2 = blockchainEngine.getConnectedWallet();
          if (!wallet2) {
            return NextResponse.json({ error: "No wallet connected" }, { status: 400 });
          }

          const transactions = blockchainEngine.getTransactionsByAddress(wallet2.address);
          return NextResponse.json({ transactions });

        case 'market':
          // Get market data
          const marketData = await blockchainEngine.getMarketData();
          return NextResponse.json(marketData);

        case 'gas':
          // Get gas price estimate
          const network = searchParams.get('network') || 'polygon';
          const gasPrice = await blockchainEngine.getGasPrice(network);
          return NextResponse.json({ gasPrice, network });

        default:
          return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });
      }
    } catch (error) {
      console.error("Blockchain API error:", error);
      return NextResponse.json(
        { error: "Failed to process blockchain request" },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return AuthMiddleware.requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json();
      const { action } = body;

      const wallet = blockchainEngine.getConnectedWallet();
      if (!wallet) {
        return NextResponse.json({ error: "No wallet connected" }, { status: 400 });
      }

      switch (action) {
        case 'tokenize':
          // Tokenize a property
          const {
            propertyId,
            valuation,
            tokenType = 'full_ownership',
            fractionalShares,
            metadata
          } = body;

          if (!propertyId || !valuation) {
            return NextResponse.json(
              { error: "Property ID and valuation are required" },
              { status: 400 }
            );
          }

          const tokenizationRequest = {
            propertyId,
            ownerId: req.user!.userId.toString(),
            tokenType,
            valuation,
            fractionalShares,
            metadata
          };

          const nft = await blockchainEngine.tokenizeProperty(tokenizationRequest);
          return NextResponse.json({ nft }, { status: 201 });

        case 'transfer':
          // Transfer an NFT
          const { nftId, toAddress } = body;

          if (!nftId || !toAddress) {
            return NextResponse.json(
              { error: "NFT ID and recipient address are required" },
              { status: 400 }
            );
          }

          const transferTx = await blockchainEngine.transferPropertyNFT(nftId, toAddress);
          return NextResponse.json({ transaction: transferTx });

        case 'buy_shares':
          // Buy fractional shares
          const { nftId: shareNftId, shareAmount } = body;

          if (!shareNftId || !shareAmount) {
            return NextResponse.json(
              { error: "NFT ID and share amount are required" },
              { status: 400 }
            );
          }

          const buyTx = await blockchainEngine.buyFractionalShares(shareNftId, parseInt(shareAmount));
          return NextResponse.json({ transaction: buyTx });

        case 'estimate_cost':
          // Estimate transaction cost
          const { transactionType, network = 'polygon' } = body;

          if (!transactionType) {
            return NextResponse.json(
              { error: "Transaction type is required" },
              { status: 400 }
            );
          }

          const estimate = await blockchainEngine.estimateTransactionCost(network, transactionType);
          return NextResponse.json(estimate);

        default:
          return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });
      }
    } catch (error) {
      console.error("Blockchain API error:", error);
      return NextResponse.json(
        { error: "Failed to process blockchain request" },
        { status: 500 }
      );
    }
  });
}