import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Networks,
  NotFoundError,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

/**
 * Stellar Testnet configuration. This app intentionally talks to Testnet only.
 */
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const NETWORK_NAME = "TESTNET";
export const FRIENDBOT_URL = "https://friendbot.stellar.org";
export const STELLAR_EXPERT_URL = "https://stellar.expert/explorer/testnet";

const server = new Horizon.Server(HORIZON_URL);

/** Whether a string is a valid Stellar public key (G...). */
export function isValidAddress(address) {
  if (!address) return false;
  try {
    Keypair.fromPublicKey(String(address).trim());
    return true;
  } catch {
    return false;
  }
}

/**
 * Fetch the native XLM balance for a public key.
 * Returns `{ funded: false }` when the account has not been created on the
 * ledger yet (never funded via Friendbot).
 */
export async function fetchAccountBalance(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);
    const native = account.balances.find((b) => b.asset_type === "native");
    return {
      funded: true,
      balance: native ? native.balance : "0.0000000",
    };
  } catch (error) {
    if (error instanceof NotFoundError || error?.response?.status === 404) {
      return { funded: false, balance: "0.0000000" };
    }
    throw error;
  }
}

/** Ask Friendbot to fund an account with testnet XLM. */
export async function fundWithFriendbot(publicKey) {
  const response = await fetch(
    `${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`,
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Friendbot request failed (${response.status}): ${body || "unknown error"}`,
    );
  }

  return response.json();
}

/**
 * Load the source account and build an unsigned XLM payment transaction.
 * Returns a `Transaction` ready to be signed by Freighter.
 */
export async function buildPaymentTransaction(sourcePublicKey, destination, amount) {
  const account = await server.loadAccount(sourcePublicKey);

  return new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: String(destination).trim(),
        asset: Asset.native(),
        amount: amount.toString(),
      }),
    )
    .setTimeout(180)
    .build();
}

/** Submit a signed transaction envelope (XDR) to Horizon. */
export async function submitSignedTransaction(signedXdr) {
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  return server.submitTransaction(tx);
}

/**
 * Translate raw Horizon/Freighter errors into readable, user-friendly text.
 */
export function getFriendlyErrorMessage(error) {
  const raw = (error && (error.message || String(error))) || "Unknown error";

  // Freighter rejects signTransaction with this message.
  if (error?.code === "rejected" || /rejected/i.test(raw)) {
    return "The transaction was rejected in Freighter.";
  }
  if (error?.code === "not_installed") {
    return raw;
  }
  if (error?.code === "access_denied") {
    return "Access to Freighter was denied. Click Connect and approve the request.";
  }
  if (error?.code === "wrong_network") {
    return raw;
  }

  // Horizon result codes (best-effort extraction).
  const extras = error?.response?.data?.extras?.result_codes;
  const opCodes = extras?.operations ? extras.operations.flat() : [];
  const txCodes = extras?.transaction ? [extras.transaction] : [];
  const codes = [...opCodes, ...txCodes].filter(Boolean);

  if (codes.includes("op_underfunded") || /underfunded/i.test(raw)) {
    return "Insufficient balance. Fund your account with Friendbot and try again.";
  }
  if (codes.includes("op_no_destination") || /no destination|destination account does not exist/i.test(raw)) {
    return "The destination account does not exist on Testnet. It must be funded before it can receive a payment.";
  }
  if (/tx_bad_auth|invalid signature|bad auth/i.test(raw)) {
    return "Transaction signature failed. Try again and approve the request in Freighter.";
  }
  if (/timeout|timed out|etimedout|fetch failed|network|econnreset|enotfound/i.test(raw)) {
    return "A network error occurred. Check your connection and try again.";
  }
  if (/tx_too_late|time bounds/i.test(raw)) {
    return "The transaction expired before it was submitted. Please try again.";
  }

  return raw;
}
