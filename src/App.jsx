import { useCallback, useEffect, useState } from "react";

import BalanceDisplay from "./components/BalanceDisplay.jsx";
import PaymentForm from "./components/PaymentForm.jsx";
import TransactionStatus from "./components/TransactionStatus.jsx";
import WalletConnect from "./components/WalletConnect.jsx";
import {
  buildPaymentTransaction,
  fetchAccountBalance,
  fundWithFriendbot,
  getFriendlyErrorMessage,
  NETWORK_NAME,
  submitSignedTransaction,
} from "./services/stellar.js";
import {
  connectWallet,
  getWalletNetwork,
  signPaymentTransaction,
} from "./services/wallet.js";

export default function App() {
  const [publicKey, setPublicKey] = useState(null);
  const [network, setNetwork] = useState(null);

  const [connecting, setConnecting] = useState(false);
  const [walletError, setWalletError] = useState(null);

  const [balanceInfo, setBalanceInfo] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState(null);
  const [funding, setFunding] = useState(false);

  const [tx, setTx] = useState({ status: "idle", hash: null, error: null });

  const wrongNetwork = Boolean(publicKey && network && network !== NETWORK_NAME);

  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    setBalanceLoading(true);
    setBalanceError(null);
    try {
      const info = await fetchAccountBalance(publicKey);
      setBalanceInfo(info);
    } catch (error) {
      setBalanceError(getFriendlyErrorMessage(error));
    } finally {
      setBalanceLoading(false);
    }
  }, [publicKey]);

  // Fetch (or clear) the balance whenever the connected account / network changes.
  useEffect(() => {
    if (publicKey && network === NETWORK_NAME) {
      refreshBalance();
    } else {
      setBalanceInfo(null);
      setBalanceError(null);
    }
  }, [publicKey, network, refreshBalance]);

  async function handleConnect() {
    setConnecting(true);
    setWalletError(null);
    try {
      const address = await connectWallet();
      setPublicKey(address);

      try {
        const { network: activeNetwork } = await getWalletNetwork();
        setNetwork(activeNetwork);
      } catch (error) {
        setWalletError({ type: "generic", message: error.message });
      }
    } catch (error) {
      setWalletError({
        type: error.code === "not_installed" ? "not_installed" : "generic",
        message: error.message,
      });
    } finally {
      setConnecting(false);
    }
  }

  function handleDisconnect() {
    setPublicKey(null);
    setNetwork(null);
    setBalanceInfo(null);
    setBalanceError(null);
    setWalletError(null);
    setTx({ status: "idle", hash: null, error: null });
  }

  async function handleFund() {
    if (!publicKey) return;
    setFunding(true);
    setBalanceError(null);
    try {
      await fundWithFriendbot(publicKey);
      await refreshBalance();
    } catch (error) {
      setBalanceError(getFriendlyErrorMessage(error));
    } finally {
      setFunding(false);
    }
  }

  async function handleSend(destination, amount) {
    if (!publicKey) return;
    setTx({ status: "pending", hash: null, error: null });
    try {
      const transaction = await buildPaymentTransaction(publicKey, destination, amount);
      const signedXdr = await signPaymentTransaction(transaction.toXDR(), publicKey);
      const result = await submitSignedTransaction(signedXdr);
      setTx({ status: "success", hash: result.hash, error: null });
      refreshBalance();
    } catch (error) {
      setTx({ status: "failure", hash: null, error: getFriendlyErrorMessage(error) });
    }
  }

  const canSend = Boolean(
    publicKey && !wrongNetwork && balanceInfo?.funded && !connecting,
  );

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Simple Payment dApp</h1>
          <p className="subtitle">Send XLM on the Stellar Testnet</p>
        </div>
        <span className="badge">Testnet</span>
      </header>

      <WalletConnect
        publicKey={publicKey}
        connecting={connecting}
        error={walletError}
        wrongNetwork={wrongNetwork}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      {publicKey && !wrongNetwork && (
        <>
          <BalanceDisplay
            balanceInfo={balanceInfo}
            loading={balanceLoading}
            funding={funding}
            error={balanceError}
            onRefresh={refreshBalance}
            onFund={handleFund}
          />

          <PaymentForm
            balanceInfo={balanceInfo}
            sending={tx.status === "pending"}
            onSend={handleSend}
          />

          <TransactionStatus status={tx.status} txHash={tx.hash} error={tx.error} />
        </>
      )}

      {publicKey && !wrongNetwork && !balanceInfo?.funded && (
        <p className="hint">
          <strong>Tip:</strong> accounts on Testnet need a small starting
          balance. Use the Friendbot button above to fund yours.
        </p>
      )}

      {!canSend && publicKey && (
        <p className="muted small">
          You can send payments once your account is funded on Testnet.
        </p>
      )}
    </div>
  );
}
