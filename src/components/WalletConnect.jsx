import { truncateAddress } from "../utils.js";

/**
 * Handles connecting/disconnecting Freighter and surfacing install /
 * wrong-network warnings.
 */
export default function WalletConnect({
  publicKey,
  connecting,
  error,
  wrongNetwork,
  onConnect,
  onDisconnect,
}) {
  if (!publicKey) {
    return (
      <div className="wallet-connect">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onConnect}
          disabled={connecting}
        >
          {connecting ? "Connecting…" : "Connect Wallet"}
        </button>

        {error?.type === "not_installed" && (
          <div className="notice notice-warn">
            <strong>Freighter is not installed.</strong>
            <p>
              Install the{" "}
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noreferrer"
              >
                Freighter browser extension
              </a>{" "}
              for Chrome or Firefox, create a wallet, then reload this page.
            </p>
          </div>
        )}

        {error?.type === "generic" && (
          <div className="notice notice-error">
            <strong>Could not connect.</strong>
            <p>{error.message}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="wallet-connect wallet-connected">
      <div className="wallet-address" title={publicKey}>
        <span className="status-dot" aria-hidden="true" />
        <span>{truncateAddress(publicKey)}</span>
      </div>

      <button
        type="button"
        className="btn btn-secondary"
        onClick={onDisconnect}
      >
        Disconnect
      </button>

      {wrongNetwork && (
        <div className="notice notice-warn">
          <strong>Wrong network.</strong>
          <p>
            Freighter is on a different network. Open the Freighter extension,
            go to <em>Settings → Network</em>, and switch to{" "}
            <strong>Testnet</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
