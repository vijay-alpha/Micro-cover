import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { TransactionRecord } from "@/components/TransactionHistory";
import { fetchHorizonOnChainHistory } from "./stellar";

// User's MicroCover Firebase Project Credentials
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAnO_wUqFygX-C8BMcbO7CwSUS8wy7eww0",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "micro-cover.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "micro-cover",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "micro-cover.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "461229433409",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:461229433409:web:1d399f611232f87916dcc0",
};

// Initialize Firebase App (Singleton Pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Read local cache for wallet address safely.
 */

export function getLocalWalletCache(walletAddress: string): {
  activePolicyIds: string[];
  historyRecords: TransactionRecord[];
} {
  if (typeof window === "undefined" || !walletAddress) {
    return { activePolicyIds: [], historyRecords: [] };
  }
  try {
    const rawPurchases =
      localStorage.getItem(`microcover_purchases_${walletAddress}`) ||
      localStorage.getItem("microcover_purchased_policies");
    const rawHistory =
      localStorage.getItem(`microcover_history_${walletAddress}`) ||
      localStorage.getItem("microcover_tx_history");

    const activePolicyIds: string[] = rawPurchases ? JSON.parse(rawPurchases) : [];
    const historyRecords: TransactionRecord[] = rawHistory ? JSON.parse(rawHistory) : [];

    return { activePolicyIds, historyRecords };
  } catch (e) {
    console.warn("LocalStorage parse error:", e);
    return { activePolicyIds: [], historyRecords: [] };
  }
}

/**
 * Write local cache for wallet address safely.
 */
export function setLocalWalletCache(
  walletAddress: string,
  activePolicyIds: string[],
  historyRecords: TransactionRecord[]
): void {
  if (typeof window === "undefined" || !walletAddress) return;
  try {
    localStorage.setItem(`microcover_purchases_${walletAddress}`, JSON.stringify(activePolicyIds));
    localStorage.setItem(`microcover_history_${walletAddress}`, JSON.stringify(historyRecords));
    localStorage.setItem("microcover_purchased_policies", JSON.stringify(activePolicyIds));
    localStorage.setItem("microcover_tx_history", JSON.stringify(historyRecords));
  } catch (e) {
    console.warn("LocalStorage write error:", e);
  }
}

/**
 * Fetch wallet-specific active policies and transaction history from:
 * 1. LocalStorage Cache
 * 2. Firebase Firestore
 * 3. Stellar Horizon On-Chain Ledger
 */
export async function fetchWalletDataFromFirebase(walletAddress: string): Promise<{
  activePolicyIds: string[];
  historyRecords: TransactionRecord[];
}> {
  if (!walletAddress) return { activePolicyIds: [], historyRecords: [] };

  // 1. Read local cache first
  const { activePolicyIds: localPolicies, historyRecords: localRecords } = getLocalWalletCache(walletAddress);

  let activePolicyIds = [...localPolicies];
  let historyRecords = [...localRecords];

  // 2. Fetch from Firebase Firestore
  try {
    const docRef = doc(db, "wallets", walletAddress);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const firestorePolicies: string[] = data.activePolicyIds || [];
      const firestoreRecords: TransactionRecord[] = data.historyRecords || [];

      activePolicyIds = Array.from(new Set([...activePolicyIds, ...firestorePolicies]));

      const recordMap = new Map<string, TransactionRecord>();
      [...historyRecords, ...firestoreRecords].forEach((rec) => {
        if (rec && (rec.id || rec.txHash)) {
          recordMap.set(rec.id || rec.txHash, rec);
        }
      });
      historyRecords = Array.from(recordMap.values());
    }
  } catch (error) {
    console.warn("Firebase fetch warning, using local & on-chain fallback:", error);
  }

  // 3. Query Stellar Horizon On-Chain Ledger
  try {
    const onChainData = await fetchHorizonOnChainHistory(walletAddress);
    if (onChainData.records.length > 0) {
      activePolicyIds = Array.from(new Set([...activePolicyIds, ...onChainData.activePolicyIds]));

      const recordMap = new Map<string, TransactionRecord>();
      [...historyRecords, ...onChainData.records].forEach((rec) => {
        if (rec && (rec.id || rec.txHash)) {
          recordMap.set(rec.id || rec.txHash, rec);
        }
      });
      historyRecords = Array.from(recordMap.values());
    }
  } catch (error) {
    console.warn("Horizon on-chain sync error:", error);
  }

  // Only update LocalStorage cache if we have data
  if (activePolicyIds.length > 0 || historyRecords.length > 0) {
    setLocalWalletCache(walletAddress, activePolicyIds, historyRecords);
  }

  return { activePolicyIds, historyRecords };
}

/**
 * Save a new policy purchase and transaction record for a specific wallet in Firebase Firestore & LocalStorage.
 */
export async function saveWalletPurchaseToFirebase(
  walletAddress: string,
  record: TransactionRecord,
  policyId: string
): Promise<void> {
  if (!walletAddress) return;

  // 1. Save to LocalStorage immediately with zero latency
  const { activePolicyIds: currentPurchases, historyRecords: currentHistory } = getLocalWalletCache(walletAddress);

  if (!currentPurchases.includes(policyId)) {
    currentPurchases.push(policyId);
  }

  const filteredHistory = currentHistory.filter((r) => r.id !== record.id && r.txHash !== record.txHash);
  const updatedHistory = [record, ...filteredHistory];

  setLocalWalletCache(walletAddress, currentPurchases, updatedHistory);

  // 2. Save to Firebase Firestore under /wallets/{walletAddress}
  try {
    const docRef = doc(db, "wallets", walletAddress);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        activePolicyIds: arrayUnion(policyId),
        historyRecords: arrayUnion(record),
        updatedAt: new Date().toISOString(),
      });
    } else {
      await setDoc(docRef, {
        walletAddress: walletAddress,
        activePolicyIds: [policyId],
        historyRecords: [record],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.warn("Failed to write to Firebase Firestore:", error);
  }
}

/**
 * Reset history for a specific wallet address in Firebase and LocalStorage.
 */
export async function clearWalletHistoryInFirebase(walletAddress: string): Promise<void> {
  try {
    if (!walletAddress) return;

    if (typeof window !== "undefined") {
      localStorage.removeItem(`microcover_purchases_${walletAddress}`);
      localStorage.removeItem(`microcover_history_${walletAddress}`);
      localStorage.removeItem("microcover_purchased_policies");
      localStorage.removeItem("microcover_tx_history");
    }

    const docRef = doc(db, "wallets", walletAddress);
    await setDoc(docRef, {
      walletAddress: walletAddress,
      activePolicyIds: [],
      historyRecords: [],
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Error clearing Firebase history:", error);
  }
}
