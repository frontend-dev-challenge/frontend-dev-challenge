/**
 * Shows the connected wallet's XLM balance, a manual refresh button, and a
 * Friendbot funding option when the account is unfunded.
 */
export default function BalanceDisplay({
  balanceInfo,
  loading,
  funding,
  error,
  onRefresh,
  onFund,
}) {
  if (!balanceInfo) {
    return (
      <section className="card">
        <h2>Balance</h2>
        {loading ? (
          <p className="muted">Loading balance…</p>
        ) : (
          <p className="muted">Connect your wallet to see your balance.</p>
        )}
      </section>
    );
  }

  return (
    <section className="card">
      <div className="balance-header">
        <h2>Balance</h2>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onRefresh}
          disabled={loading || funding}
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {loading ? (
        <p className="muted">Loading balance…</p>
      ) : balanceInfo.funded ? (
        <p className="balance-value">
          {balanceInfo.balance} <span className="xlm">XLM</span>
        </p>
      ) : (
        <div className="unfunded">
          <p>
            This account is <strong>not funded</strong> on Testnet yet.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onFund}
            disabled={funding}
          >
            {funding ? "Funding…" : "Fund with Friendbot"}
          </button>
        </div>
      )}

      {error && (
        <div className="notice notice-error">
          <strong>Balance error.</strong>
          <p>{error}</p>
        </div>
      )}
    </section>
  );
}
