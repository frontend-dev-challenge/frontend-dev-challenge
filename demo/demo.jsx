import { createRoot } from "react-dom/client";

import BalanceDisplay from "../src/components/BalanceDisplay.jsx";
import PaymentForm from "../src/components/PaymentForm.jsx";
import TransactionStatus from "../src/components/TransactionStatus.jsx";
import WalletConnect from "../src/components/WalletConnect.jsx";
import "../src/index.css";

// Realistic Testnet mock data (valid Stellar public key + 64-hex tx hash).
const PUBLIC_KEY = "GDVOWQRDCGGEUXFYCJI65PPW3DJZBJOE6RV47UOLAOCZFMBIJJIVS5DO";
const TX_HASH =
  "59d472476b475ccbf34b9aff92a227eedbfe91424d0968132787e503f2a0f200";

function Header() {
  return (
    <header className="app-header">
      <div>
        <h1>Simple Payment dApp</h1>
        <p className="subtitle">Send XLM on the Stellar Testnet</p>
      </div>
      <span className="badge">Testnet</span>
    </header>
  );
}

function ConnectedWallet() {
  return (
    <WalletConnect
      publicKey={PUBLIC_KEY}
      connecting={false}
      error={null}
      wrongNetwork={false}
      onConnect={() => {}}
      onDisconnect={() => {}}
    />
  );
}

function Screen({ id, children }) {
  return (
    <div id={id} className="screen">
      <div className="app">
        <Header />
        {children}
      </div>
    </div>
  );
}

function Demo() {
  return (
    <div className="demo-root">
      {/* 1. Wallet connected state */}
      <Screen id="wallet-connected">
        <ConnectedWallet />
      </Screen>

      {/* 2. Balance displayed */}
      <Screen id="balance-displayed">
        <ConnectedWallet />
        <BalanceDisplay
          balanceInfo={{ funded: true, balance: "10000.0000000" }}
          loading={false}
          funding={false}
          error={null}
          onRefresh={() => {}}
          onFund={() => {}}
        />
      </Screen>

      {/* 3. Successful testnet transaction (full app in success state) */}
      <Screen id="successful-transaction">
        <ConnectedWallet />
        <BalanceDisplay
          balanceInfo={{ funded: true, balance: "9999.9999000" }}
          loading={false}
          funding={false}
          error={null}
          onRefresh={() => {}}
          onFund={() => {}}
        />
        <PaymentForm
          balanceInfo={{ funded: true, balance: "9999.9999000" }}
          sending={false}
          onSend={() => {}}
        />
        <TransactionStatus status="success" txHash={TX_HASH} error={null} />
      </Screen>

      {/* 4. Transaction result shown to the user (hash + explorer link) */}
      <Screen id="transaction-result">
        <TransactionStatus status="success" txHash={TX_HASH} error={null} />
      </Screen>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Demo />);
