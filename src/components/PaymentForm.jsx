import { useState } from "react";

import { isValidAddress } from "../services/stellar.js";

const AMOUNT_REGEX = /^\d+(\.\d{1,7})?$/;

/**
 * Payment form with client-side validation for the destination address and
 * XLM amount. Parent is responsible for building/signing/submitting.
 */
export default function PaymentForm({ balanceInfo, sending, onSend }) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState({});

  function validate() {
    const next = {};

    if (!destination.trim()) {
      next.destination = "Destination address is required.";
    } else if (!isValidAddress(destination)) {
      next.destination = "That does not look like a valid Stellar address.";
    }

    if (!amount.trim()) {
      next.amount = "Amount is required.";
    } else if (!AMOUNT_REGEX.test(amount)) {
      next.amount = "Enter a positive number with up to 7 decimal places.";
    } else if (Number(amount) <= 0) {
      next.amount = "Amount must be greater than zero.";
    } else if (
      balanceInfo?.funded &&
      Number(amount) > Number(balanceInfo.balance)
    ) {
      next.amount = "Amount exceeds your available balance.";
    }

    return next;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      onSend(destination.trim(), amount);
    }
  }

  return (
    <section className="card">
      <h2>Send XLM</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="destination">Destination address</label>
          <input
            id="destination"
            type="text"
            value={destination}
            placeholder="GABC…WXYZ"
            onChange={(e) => setDestination(e.target.value)}
            disabled={sending}
            autoComplete="off"
            spellCheck="false"
          />
          {errors.destination && (
            <span className="field-error">{errors.destination}</span>
          )}
        </div>

        <div className="field">
          <label htmlFor="amount">Amount (XLM)</label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            value={amount}
            placeholder="0.0000000"
            onChange={(e) => setAmount(e.target.value)}
            disabled={sending}
            autoComplete="off"
          />
          {errors.amount && <span className="field-error">{errors.amount}</span>}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={sending}
        >
          {sending ? "Sending…" : "Send payment"}
        </button>
      </form>
    </section>
  );
}
