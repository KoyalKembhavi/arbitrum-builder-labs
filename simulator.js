// =============================================
// ArbiLearn - Block Mining Simulator
// Uses SHA-256 and proof-of-work to validate a chain
// =============================================

const INITIAL_PREV_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
const TARGET_PREFIX = '00';
let currentMiningBlock = null;
let isMining = false;

const state = {
  1: {
    data: '',
    prevHash: INITIAL_PREV_HASH,
    nonce: 0,
    hash: '',
    mined: false,
    stale: false
  },
  2: {
    data: '',
    prevHash: '',
    nonce: 0,
    hash: '',
    mined: false,
    stale: false
  }
};

// Convert a raw hash ArrayBuffer to a hexadecimal string
function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Compute SHA-256 of the given text using the Web Crypto API
async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return toHex(hashBuffer);
}

// Update the value of a given input field by ID
function setInputValue(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.value = value;
  }
}

// Update the status badge for a block depending on validity
function updateStatus(blockId) {
  const block = state[blockId];
  const statusElement = document.getElementById(`block-${blockId}-status`);

  if (!block.mined) {
    statusElement.textContent = '⚠️ Not mined';
    statusElement.className = 'status-badge warning';
    return;
  }

  const hashValid = block.hash.startsWith(TARGET_PREFIX);
  const chainValid = blockId === 1 || state[blockId].prevHash === state[1].hash;

  if (!hashValid || !chainValid || block.stale) {
    statusElement.textContent = '❌ Chain Broken!';
    statusElement.className = 'status-badge error';
  } else {
    statusElement.textContent = '✅ Block Valid';
    statusElement.className = 'status-badge success';
  }
}

// Refresh the block card values from internal state
function renderBlock(blockId) {
  const block = state[blockId];
  setInputValue(`block-${blockId}-data`, block.data);
  setInputValue(`block-${blockId}-prev`, block.prevHash);
  setInputValue(`block-${blockId}-nonce`, block.nonce);
  document.getElementById(`block-${blockId}-hash`).textContent = block.hash || 'Hash will appear here after mining';
  updateStatus(blockId);
}

// Set Block 2's previous hash to Block 1's mined hash after Block 1 is validated
function syncBlockTwoPreviousHash() {
  if (state[1].mined && !state[1].stale) {
    state[2].prevHash = state[1].hash;
    setInputValue('block-2-prev', state[2].prevHash);
  }
}

function markDependentBlocksInvalid() {
  if (!state[1].mined || !state[2].mined) {
    return;
  }

  // If Block 1 has been altered after mining or Block 2's previous hash no longer matches,
  // then Block 2 should be marked as broken.
  state[2].stale = state[1].stale || state[2].prevHash !== state[1].hash;
}

// Display a mining status message below the block cards
function updateMiningMessage(message) {
  const messageElement = document.getElementById('mining-message');
  if (messageElement) {
    messageElement.textContent = message;
  }
}

// Enable or disable the mine buttons during an active mining cycle
function setControlsDisabled(disabled) {
  document.getElementById('block-1-mine').disabled = disabled;
  document.getElementById('block-2-mine').disabled = disabled;
}

// Perform proof-of-work mining for the selected block until the hash meets target criteria
async function mineBlock(blockId) {
  if (isMining) return;
  isMining = true;
  currentMiningBlock = blockId;
  setControlsDisabled(true);

  const block = state[blockId];
  block.data = document.getElementById(`block-${blockId}-data`).value;
  block.prevHash = document.getElementById(`block-${blockId}-prev`).value || '';
  block.nonce = 0;
  block.hash = '';
  block.mined = false;
  block.stale = false;

  renderBlock(blockId);
  updateMiningMessage(`⛏ Mining Block ${blockId}... nonce: 0`);

  while (isMining) {
    block.nonce += 1;
    setInputValue(`block-${blockId}-nonce`, block.nonce);
    if (block.nonce % 3 === 0) {
      updateMiningMessage(`⛏ Mining Block ${blockId}... nonce: ${block.nonce}`);
    }

    const rawString = `${blockId}|${block.prevHash}|${block.data}|${block.nonce}`;
    const hash = await sha256(rawString);

    if (hash.startsWith(TARGET_PREFIX)) {
      block.hash = hash;
      block.mined = true;
      block.stale = false;
      break;
    }

    if (block.nonce % 50 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  if (!isMining) {
    updateMiningMessage('⛏ Mining cancelled');
    setControlsDisabled(false);
    return;
  }

  updateMiningMessage(`✅ Block ${blockId} mined! Hash starts with ${TARGET_PREFIX}`);
  renderBlock(blockId);

  if (blockId === 1) {
    syncBlockTwoPreviousHash();
    state[2].stale = state[2].mined && state[2].prevHash !== state[1].hash;
    renderBlock(2);
  }

  if (blockId === 2) {
    markDependentBlocksInvalid();
    renderBlock(2);
  }

  setControlsDisabled(false);
  isMining = false;
  currentMiningBlock = null;
}

// Handle live input changes and revalidate affected blocks
function handleInputChange(blockId) {
  const block = state[blockId];
  const currentData = document.getElementById(`block-${blockId}-data`).value;

  if (block.mined && currentData !== block.data) {
    block.stale = true;
  }

  block.data = currentData;
  renderBlock(blockId);

  if (blockId === 1) {
    markDependentBlocksInvalid();
    renderBlock(2);
  }
}

// Attach event listeners to mining controls and inputs
function setUpListeners() {
  document.getElementById('block-1-data').addEventListener('input', () => handleInputChange(1));
  document.getElementById('block-2-data').addEventListener('input', () => handleInputChange(2));
  document.getElementById('block-1-mine').addEventListener('click', () => mineBlock(1));
  document.getElementById('block-2-mine').addEventListener('click', () => mineBlock(2));
}

function initialize() {
  renderBlock(1);
  renderBlock(2);
  updateMiningMessage('⛏ Ready to mine a block');
  setUpListeners();
}

window.addEventListener('DOMContentLoaded', initialize);
