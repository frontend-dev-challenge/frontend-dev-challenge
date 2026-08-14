import {
  getNetwork,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";

import { NETWORK_NAME, NETWORK_PASSPHRASE } from "./stellar.js";

/** Typed error wrapper so the UI can react to specific wallet failures. */
export class WalletError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "WalletError";
    this.code = code;
  }
}

/** Whether the Freighter browser extension is installed. */
export async function isFreighterInstalled() {
  try {
    const { isConnected: installed } = await isConnected();
    return Boolean(installed);
  } catch {
    return false;
  }
}

/**
 * Connect to Freighter: verify the extension is present, request the user's
 * public key, and return the address.
 */
export async function connectWallet() {
  const installed = await isFreighterInstalled();
  if (!installed) {
    throw new WalletError(
      "not_installed",
      "Freighter is not installed. Install the extension and reload this page.",
    );
  }

  const { address, error } = await requestAccess();
  if (error) {
    throw new WalletError("access_denied", error.message);
  }
  if (!address) {
    throw new WalletError("access_denied", "Could not read a public key from Freighter.");
  }

  return address;
}

/** Read the network currently selected in Freighter. */
export async function getWalletNetwork() {
  const { network, networkPassphrase, error } = await getNetwork();
  if (error) {
    throw new WalletError("network", error.message);
  }
  return { network, networkPassphrase };
}

/** Whether Freighter is currently set to Stellar Testnet. */
export async function isWalletOnTestnet() {
  const { network } = await getWalletNetwork();
  return network === NETWORK_NAME;
}

/**
 * Ask Freighter to sign a transaction XDR for the given account.
 * Returns the signed envelope XDR, or throws on rejection.
 */
export async function signPaymentTransaction(xdr, publicKey) {
  const { signedTxXdr, error } = await signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: publicKey,
  });

  if (error) {
    const rejected = /rejected/i.test(error.message || "");
    throw new WalletError(
      rejected ? "rejected" : "signing_failed",
      error.message || "Freighter could not sign the transaction.",
    );
  }

  return signedTxXdr;
}
