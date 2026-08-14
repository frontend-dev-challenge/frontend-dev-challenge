import { STELLAR_EXPERT_URL } from "../services/stellar.js";

/**
 * Renders the lifecycle of a submitted payment: pending, success (with tx
 * hash + explorer link), or failure (with a readable message).
 */
export default function TransactionStatus({ status, txHash, error }) {
  if (status === "idle") return null;

  if (status === "pending") {
    return (
      <div className="notice notice-info" role="status">
        <span className="spinner" aria-hidden="true" />
        Submitting transaction…
      </div>
    );
  }

  if (status === "success") {
    const explorerUrl = `${STELLAR_EXPERT_URL}/tx/${txHash}`;
    return (
      <div className="notice notice-success" role="status">
        <strong>Payment sent!</strong>
        <p className="tx-hash">
          Transaction:{" "}
          <a href={explorerUrl} target="_blank" rel="noreferrer">
            {txHash}
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="notice notice-error" role="alert">
      <strong>Transaction failed.</strong>
      <p>{error}</p>
    </div>
  );
}
