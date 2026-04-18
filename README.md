# ArbiLearn

A 4-page educational Web3 website built for the Arbitrum Builder Labs assignment by LamprosDAO.

## Screenshots

- `screenshots/home.png`
- `screenshots/concepts.png`
- `screenshots/prices.png`
- `screenshots/simulator.png`

## Pages

- `index.html` — Home page introducing Web3, blockchain, and Arbitrum with core concept cards.
- `concepts.html` — Educational page covering decentralization, Layer 2 scaling, smart contracts, and other Web3 fundamentals.
- `prices.html` — Live Crypto Prices page that fetches real-time BTC, ETH, SOL, MATIC, and ARB prices from the CoinGecko API.
- `simulator.html` — Block Mining Simulator page demonstrating proof-of-work, nonce searching, SHA-256 hashing, and chain immutability.

## Run Locally

Clone the repo and open `index.html` in your browser — no installation required.

## Tech Stack

- HTML
- CSS
- JavaScript
- CoinGecko API
- Web Crypto API

## Known Issues / Future Improvements

- Block mining simulator currently uses a simple difficulty target of `00`, which can be adjusted for more realistic mining difficulty.
- Live prices page depends on the CoinGecko API and may fail if the API is unavailable or rate-limited.
- Add mobile navigation improvements and better responsive layout for the simulator and prices pages.
- Add animations and transitions for a smoother learning experience.

## Author

Koyal Kembhavi — https://github.com/KoyalKembhavi