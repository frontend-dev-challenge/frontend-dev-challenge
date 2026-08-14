# Simple Payment dApp — Stellar Testnet

A **Level 1 (White Belt)** Stellar dApp: send XLM to any address on the Stellar
**Testnet** using the **Freighter** browser extension wallet.

This project focuses on the core fundamentals of Stellar development —
**wallets, balances, and transactions** — and demonstrates:

- Connecting a Freighter wallet and funding it via **Friendbot**
- Correctly displaying the wallet's **XLM balance**
- Building, signing, and submitting an **XLM payment** on Testnet

## Tech Stack

| Layer      | Tech                                                  |
| ---------- | ----------------------------------------------------- |
| Frontend   | [React](https://react.dev) + [Vite](https://vite.dev) |
| Wallet     | [`@stellar/freighter-api`](https://www.npmjs.com/package/@stellar/freighter-api) |
| Blockchain | [`@stellar/stellar-sdk`](https://www.npmjs.com/package/@stellar/stellar-sdk) |
| Network    | Stellar **Testnet** — `https://horizon-testnet.stellar.org` |

## Features

- ✅ Freighter detection with install instructions
- ✅ Wrong-network detection with a prompt to switch to Testnet
- ✅ Connect / Disconnect wallet (truncated address display)
- ✅ Live XLM balance with a manual refresh button
- ✅ Friendbot funding for unfunded accounts
- ✅ Payment form with destination + amount validation
- ✅ Build → sign (Freighter) → submit transaction flow
- ✅ Pending / success / failure feedback with tx hash + Stellar Expert link
- ✅ Friendly error messages for invalid address, insufficient balance,
  rejected transactions, and network failures

---

## 1. Install the Freighter Wallet

1. Visit <https://www.freighter.app/> and install the extension for
   [Chrome](https://chromewebstore.google.com/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk)
   or [Firefox](https://addons.mozilla.org/en-US/firefox/addon/freighter/).
2. Open the extension and complete the onboarding flow to create (or import) a
   wallet.
3. Keep your **secret recovery phrase** safe — never share it with anyone,
   including this app.

## 2. Switch Freighter to Testnet

This app talks to **Testnet only**. Make sure Freighter is on Testnet:

1. Open the Freighter extension.
2. Go to **Settings → Network**.
3. Select **Testnet**.
4. Reload this app.

> If Freighter is on a different network, the app will show a warning and ask
> you to switch.

## 3. Fund a Test Account with Friendbot

Testnet accounts need a starting balance before they can send payments.

**Option A — in this app:** connect your wallet. If it's unfunded, the app shows
a **"Fund with Friendbot"** button that sends testnet XLM to your account.

**Option B — manually:** visit <https://stellar.expert/explorer/testnet/friendbot>
(or use the endpoint `https://friendbot.stellar.org?addr=<YOUR_PUBLIC_KEY>`) and
request test XLM.

## 4. Run Locally

Prerequisites: [Node.js](https://nodejs.org) 20.19+ (or 22.12+).

```bash
# install dependencies
npm install

# start the dev server
npm run dev
```

Open the printed localhost URL (usually http://localhost:5173) in your browser,
install Freighter, switch it to Testnet, and connect.

Other scripts:

```bash
npm run build     # production build into dist/
npm run preview   # preview the production build locally
```

## Project Structure

```
src/
├── components/
│   ├── WalletConnect.jsx      # connect/disconnect + install/network warnings
│   ├── BalanceDisplay.jsx     # balance, refresh, Friendbot funding
│   ├── PaymentForm.jsx        # payment form with validation
│   └── TransactionStatus.jsx  # pending/success/failure feedback
├── services/
│   ├── stellar.js             # Horizon, balance, Friendbot, tx build/submit
│   └── wallet.js              # Freighter connect/network/sign logic
├── App.jsx                    # app state + wiring
├── main.jsx                   # React entry point
├── index.css                  # styling
└── utils.js                   # formatting helpers
```

## Links

- **Live deployment:** <https://your-project.vercel.app> (TODO: update)
- **GitHub repo:** <https://github.com/your-username/stellar-simple-payment-dapp>
  (TODO: update)

## Deployment

This is a static Vite app — deployable anywhere that serves static files:

- **Vercel:** `vercel` (framework preset: Vite; build `npm run build`, output `dist`)
- **Netlify:** build command `npm run build`, publish directory `dist`
- **GitHub Pages:** build and publish the `dist/` folder (set `base` in
  `vite.config.js` to your repo name)

---

_Learning goals covered: connect + fund a Freighter wallet (Friendbot), display
XLM balance, and send an XLM transaction on Testnet._
