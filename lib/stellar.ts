import {
  isConnected as freighterIsConnected,
  getAddress as freighterGetAddress,
  requestAccess as freighterRequestAccess,
  getNetwork as freighterGetNetwork,
  signTransaction as freighterSignTx,
} from "@stellar/freighter-api";
import {
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
  Keypair,
  Memo,
} from "@stellar/stellar-sdk";
import { TransactionRecord } from "@/components/TransactionHistory";

export const HORIZON_TESTNET_URL = "https://horizon-testnet.stellar.org";
export const STELLAR_EXPERT_TESTNET_TX_URL = "https://stellar.expert/explorer/testnet/tx/";

// Valid, Active 56-character Protocol Micro-Insurance Pool accounts on Stellar Testnet
export const PROTOCOL_INSURANCE_POOL_ADDRESS = "GBWVMYMYP3XXZHRCMUDRZAN3SZRKL65WEKFLIWBSBOY22OM4QEBTYC23"; 
export const FALLBACK_POOL_ADDRESS = "GAOKREOZ2KOOPBXYSL3NUWN5GUZDDXM32B5ZQTWZ5OHJLFFNVPTBTWM2";

// Initialize Horizon Server instance for Stellar Testnet
export const horizonServer = new Horizon.Server(HORIZON_TESTNET_URL);

/**
 * Check if the Freighter extension is installed in the browser.
 */
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const res = await freighterIsConnected();
    if (typeof res === "boolean") return res;
    if (res && typeof res === "object" && "isConnected" in res) {
      return Boolean(res.isConnected);
    }
    if (typeof window !== "undefined" && ((window as any).freighter || (window as any).freighterApi)) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking Freighter connection status:", error);
    return false;
  }
}

/**
 * Connect to Freighter Wallet by requesting access.
 */
export async function connectFreighterWallet(): Promise<{ address: string | null; error?: string }> {
  try {
    const installed = await isFreighterInstalled();
    if (!installed) {
      return {
        address: null,
        error: "Freighter extension not detected. Please install Freighter from freighter.app or enable browser extension permissions.",
      };
    }

    const accessRes = await freighterRequestAccess();
    if (accessRes && typeof accessRes === "object") {
      if ("address" in accessRes && typeof accessRes.address === "string" && accessRes.address) {
        return { address: accessRes.address };
      }
      if ("error" in accessRes && accessRes.error) {
        return { address: null, error: String(accessRes.error) };
      }
    }

    const addrRes = await freighterGetAddress();
    if (addrRes && typeof addrRes === "object" && "address" in addrRes && addrRes.address) {
      return { address: addrRes.address };
    }

    return { address: null, error: "Could not retrieve account address from Freighter." };
  } catch (error: any) {
    console.error("Freighter connect error:", error);
    return {
      address: null,
      error: error?.message || "Freighter connection request was canceled or rejected by user.",
    };
  }
}

/**
 * Legacy getter helper
 */
export async function getFreighterPublicKey(): Promise<string | null> {
  const result = await connectFreighterWallet();
  if (result.address) return result.address;
  if (result.error) throw new Error(result.error);
  return null;
}

/**
 * Retrieve current network setting from Freighter.
 */
export async function getFreighterNetwork(): Promise<string | null> {
  try {
    const res = await freighterGetNetwork();
    if (typeof res === "string") return res;
    if (res && typeof res === "object" && "network" in res) {
      return String(res.network);
    }
    return null;
  } catch (error) {
    console.error("Error getting Freighter network:", error);
    return null;
  }
}

/**
 * Fetch current XLM balance for a given Stellar account address from Horizon Testnet.
 */
export async function fetchXlmBalance(publicKey: string): Promise<string> {
  try {
    const account = await horizonServer.loadAccount(publicKey);
    const xlmBalanceObj = account.balances.find(
      (b: any) => b.asset_type === "native"
    );
    return xlmBalanceObj ? parseFloat(xlmBalanceObj.balance).toFixed(2) : "0.00";
  } catch (error: any) {
    console.error("Failed to fetch balance from Horizon Testnet:", error);
    if (error?.response?.status === 404) {
      return "UNFUNDED";
    }
    throw error;
  }
}

/**
 * Request Friendbot to fund an account on Stellar Testnet if unfunded.
 */
export async function requestFriendbotFunding(publicKey: string): Promise<boolean> {
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
    return response.ok;
  } catch (error) {
    console.error("Friendbot request failed:", error);
    return false;
  }
}

/**
 * Generate a real funded Demo Stellar Testnet Keypair for testing.
 */
export async function createDemoTestnetWallet(): Promise<{ secretKey: string; publicKey: string }> {
  const pair = Keypair.random();
  await requestFriendbotFunding(pair.publicKey());
  return {
    secretKey: pair.secret(),
    publicKey: pair.publicKey(),
  };
}

/**
 * Fetch on-chain payment history directly from Stellar Horizon Testnet Node.
 */
export async function fetchHorizonOnChainHistory(walletAddress: string): Promise<{
  activePolicyIds: string[];
  records: TransactionRecord[];
}> {
  try {
    if (!walletAddress) return { activePolicyIds: [], records: [] };

    const paymentsResponse = await horizonServer
      .payments()
      .forAccount(walletAddress)
      .order("desc")
      .limit(30)
      .call();

    const records: TransactionRecord[] = [];
    const activePolicyIdsSet = new Set<string>();

    for (const record of paymentsResponse.records) {
      if (record.type === "payment") {
        const paymentOp = record as any;
        // Check if payment is sent to insurance pool
        if (
          paymentOp.to === PROTOCOL_INSURANCE_POOL_ADDRESS ||
          paymentOp.to === FALLBACK_POOL_ADDRESS ||
          paymentOp.from === walletAddress
        ) {
          const amountFloat = parseFloat(paymentOp.amount || "0").toFixed(2);
          let policyTitle = "Server Downtime / Web3 API Outage";
          let policyCategory = "Infrastructure";
          let policyId = "policy-server-downtime";

          if (amountFloat === "2.00") {
            policyTitle = "DeFi Stablecoin Peg De-peg Cover";
            policyCategory = "DeFi Protocol";
            policyId = "policy-defi-peg";
          } else if (amountFloat === "5.00") {
            policyTitle = "Extreme Weather & Drought Micro-Cover";
            policyCategory = "Real World Asset";
            policyId = "policy-weather-drought";
          }

          activePolicyIdsSet.add(policyId);

          const formattedDate = paymentOp.created_at
            ? new Date(paymentOp.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ", " + new Date(paymentOp.created_at).toLocaleDateString()
            : new Date().toLocaleDateString();

          records.push({
            id: paymentOp.transaction_hash || paymentOp.id,
            policyTitle,
            policyCategory,
            premiumXlm: amountFloat,
            txHash: paymentOp.transaction_hash || paymentOp.id,
            timestamp: formattedDate,
            status: "ACTIVE",
          });
        }
      }
    }

    return {
      activePolicyIds: Array.from(activePolicyIdsSet),
      records,
    };
  } catch (error) {
    console.warn("Horizon on-chain history fetch warning:", error);
    return { activePolicyIds: [], records: [] };
  }
}

/**
 * Build, Sign, and Submit a Micro-Insurance Premium Payment Transaction on Stellar Testnet.
 */
export async function payPolicyPremium(
  senderAddress: string,
  amountXlm: string,
  policyName: string,
  demoSecretKey?: string
): Promise<{ success: boolean; hash?: string; error?: string }> {
  try {
    // 1. Fetch current sender account state from Horizon Testnet
    let account;
    try {
      account = await horizonServer.loadAccount(senderAddress);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        return {
          success: false,
          error: "Account not activated on Stellar Testnet. Please click the 'Fund 10,000 XLM Faucet' button first.",
        };
      }
      throw err;
    }

    // 2. Select valid 56-char destination address
    const destinationAddress =
      senderAddress === PROTOCOL_INSURANCE_POOL_ADDRESS
        ? FALLBACK_POOL_ADDRESS
        : PROTOCOL_INSURANCE_POOL_ADDRESS;

    // 3. Build Payment Transaction
    const memoText = policyName.slice(0, 28);
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: destinationAddress,
          asset: Asset.native(),
          amount: amountXlm,
        })
      )
      .addMemo(Memo.text(memoText))
      .setTimeout(60)
      .build();

    let signedXdr: string | null = null;

    // If using Demo Wallet Secret Key
    if (demoSecretKey) {
      const demoPair = Keypair.fromSecret(demoSecretKey);
      transaction.sign(demoPair);
      signedXdr = transaction.toXDR();
    } else {
      // 4. Request signature from Freighter Wallet extension
      const xdr = transaction.toXDR();
      let signedResult;
      try {
        signedResult = await freighterSignTx(xdr, {
          networkPassphrase: Networks.TESTNET,
        });
      } catch (signErr: any) {
        console.error("Freighter signing error:", signErr);
        return {
          success: false,
          error: signErr?.message || "Transaction signing request was canceled or rejected in Freighter.",
        };
      }

      if (typeof signedResult === "string") {
        signedXdr = signedResult;
      } else if (signedResult && typeof signedResult === "object") {
        if ("signedTxXdr" in signedResult && typeof signedResult.signedTxXdr === "string") {
          signedXdr = signedResult.signedTxXdr;
        } else if ("error" in signedResult && signedResult.error) {
          return {
            success: false,
            error: String(signedResult.error),
          };
        }
      }
    }

    if (!signedXdr) {
      return {
        success: false,
        error: "Failed to retrieve signed transaction XDR from wallet.",
      };
    }

    // 5. Submit transaction to Horizon Testnet
    const transactionToSubmit = TransactionBuilder.fromXDR(
      signedXdr,
      Networks.TESTNET
    );
    const txResponse = await horizonServer.submitTransaction(transactionToSubmit);

    return {
      success: true,
      hash: txResponse.hash,
    };
  } catch (error: any) {
    console.error("Transaction submission failed:", error);
    const resultCodes = error?.response?.data?.extras?.result_codes;
    let errMsg = "Failed to execute payment transaction on Stellar Testnet.";

    if (resultCodes) {
      if (resultCodes.transaction) {
        errMsg = `Transaction error: ${resultCodes.transaction}`;
      }
      if (resultCodes.operations && resultCodes.operations.length > 0) {
        errMsg += ` (${resultCodes.operations.join(", ")})`;
      }
    } else if (error?.message) {
      errMsg = error.message;
    }

    return {
      success: false,
      error: errMsg,
    };
  }
}
