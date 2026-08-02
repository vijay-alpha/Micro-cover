const ErrorType = {
  USER_REJECTION: "USER_REJECTION",
  INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
  CONTRACT_NETWORK_FAILURE: "CONTRACT_NETWORK_FAILURE",
};

const DEPLOYED_SOROBAN_CONTRACT_ID = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

function categorizeTransactionError(error, senderBalanceXlm, requiredXlm) {
  const errString = String(error?.message || error || "").toLowerCase();

  if (
    errString.includes("cancel") ||
    errString.includes("reject") ||
    errString.includes("decline") ||
    errString.includes("closed") ||
    errString.includes("user denied")
  ) {
    return {
      type: ErrorType.USER_REJECTION,
      title: "Error 1: Signature Request Cancelled",
      message: "You rejected or closed the Freighter Wallet signature confirmation popup.",
      solution: "Click 'Pay Premium' again and approve the signature prompt inside your Freighter Wallet.",
    };
  }

  if (
    errString.includes("underfunded") ||
    errString.includes("insufficient balance") ||
    errString.includes("op_underfunded") ||
    errString.includes("404") ||
    (senderBalanceXlm && requiredXlm && parseFloat(senderBalanceXlm) < parseFloat(requiredXlm))
  ) {
    return {
      type: ErrorType.INSUFFICIENT_FUNDS,
      title: "Error 2: Insufficient XLM Balance",
      message: `Your account balance (${senderBalanceXlm || "0.00"} XLM) is lower than the required policy premium (${requiredXlm || "1.00"} XLM).`,
      solution: "Click 'Fund 10,000 XLM Faucet' button in your wallet dashboard to add testnet XLM instantly.",
    };
  }

  return {
    type: ErrorType.CONTRACT_NETWORK_FAILURE,
    title: "Error 3: Soroban Contract / Horizon Network Error",
    message: error?.message || "Soroban Smart Contract invocation failed or Horizon Testnet node timed out.",
    solution: "Verify network status or try switching to Demo Testnet Wallet for instant execution.",
  };
}

module.exports = {
  ErrorType,
  DEPLOYED_SOROBAN_CONTRACT_ID,
  categorizeTransactionError,
};
