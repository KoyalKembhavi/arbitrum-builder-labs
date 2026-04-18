// =============================================
// ArbiLearn - Live Crypto Prices
// Fetches real-time data from CoinGecko API
// =============================================

// Coin configuration with display names and symbols
const COINS = {
  bitcoin: { name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
  ethereum: { name: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
  solana: { name: 'Solana', symbol: 'SOL', icon: '◎' },
  'matic-network': { name: 'Polygon', symbol: 'MATIC', icon: '🟣' },
  arbitrum: { name: 'Arbitrum', symbol: 'ARB', icon: '🔵' }
};

// CoinGecko API URL
const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,solana,matic-network,arbitrum&vs_currencies=usd&include_24hr_change=true';

// Format price with proper decimals and commas
function formatPrice(price) {
  if (!Number.isFinite(price)) {
    return 'N/A';
  }

  if (price >= 1000) {
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (price >= 1) {
    return '$' + price.toFixed(2);
  } else {
    return '$' + price.toFixed(4);
  }
}

// Format percentage change into a styled badge with direction icon
function formatChange(change) {
  if (!Number.isFinite(change)) {
    return {
      html: '<span>N/A</span>',
      className: ''
    };
  }

  const isPositive = change >= 0;
  const icon = isPositive ? '🟢▲' : '🔴▼';
  const sign = isPositive ? '+' : '';
  const className = isPositive ? 'positive' : 'negative';

  return {
    html: `<span>${icon} ${sign}${change.toFixed(2)}%</span>`,
    className: className
  };
}

// Create a price card HTML element for a single coin
function createPriceCard(coinId, data) {
  const coin = COINS[coinId];
  const change = formatChange(data.usd_24h_change);

  return `
    <div class="card price-card" data-coin="${coinId}">
      <div class="crypto-icon">${coin.icon}</div>
      <div class="crypto-name">${coin.name}</div>
      <div class="crypto-symbol">${coin.symbol}</div>
      <div class="crypto-price">${formatPrice(data.usd)}</div>
      <div class="crypto-change ${change.className}">${change.html}</div>
    </div>
  `;
}

// Show loading state while prices are fetched
function showLoading() {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('error-message').style.display = 'none';
  document.getElementById('prices-container').innerHTML = '';
}

// Display an error message when fetching fails
function showError(message) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('error-message').style.display = 'block';
  document.getElementById('error-text').textContent = message;
}

// Hide loading and keep the fetched price cards visible
function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

// Fetch prices from CoinGecko API and render them on the page
async function fetchPrices() {
  showLoading();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Generate price cards for each coin
    const coinsToDisplay = ['bitcoin', 'ethereum', 'solana', 'matic-network', 'arbitrum'];
    const cardsHTML = coinsToDisplay
      .filter(coinId => data[coinId])
      .map(coinId => createPriceCard(coinId, data[coinId]))
      .join('');

    hideLoading();
    document.getElementById('prices-container').innerHTML = cardsHTML;

    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.price-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      card.style.transitionDelay = `${index * 0.1}s`;

      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 50);
    });

  } catch (error) {
    console.error('Error fetching prices:', error);
    showError(error.message + ' Please try again in a few moments.');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  fetchPrices();
});

// Make fetchPrices available globally for the refresh button
window.fetchPrices = fetchPrices;
