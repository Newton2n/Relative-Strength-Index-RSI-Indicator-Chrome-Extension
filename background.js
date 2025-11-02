// === RSI ALERT - BTC & ETH (3m, 5m, 15m) ===
// Local + Telegram notifications with BDT time
console.log("[RSI Alert] Service worker started");

const CONFIG = {
  pairs: [
    { symbol: "BTCUSDT", interval: "3m" },
    { symbol: "BTCUSDT", interval: "5m" },
    { symbol: "BTCUSDT", interval: "15m" },
    { symbol: "ETHUSDT", interval: "3m" },
    { symbol: "ETHUSDT", interval: "5m" },
    { symbol: "ETHUSDT", interval: "15m" },
  ],
  rsiPeriod: 14,
  checkEverySeconds: 10, // check every 10 seconds
  alertLower: 30,
  alertUpper: 70,
  klinesLimit: 200, // smoother RSI (same as TradingView)
  telegram: {
    botToken: "Telegram Bot token",
    chatId: "Telegram chat Id",
  },
  coolDownMinutes: 2, // alert again only if still above/below after 2 min
};

// Track states
let lastRSIState = {};
let lastAlertTime = {};

async function fetchKlines(symbol, interval, limit) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${symbol} ${interval}`);
  const data = await response.json();
  return data.map((k) => parseFloat(k[4])); // close prices
}

// --- RSI Calculation (Wilder's Smoothing, TradingView accurate) ---
function calculateRSI(closes, period) {
  if (closes.length < period + 1) return null;

  let gains = 0,
    losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  gains /= period;
  losses /= period;

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    gains = (gains * (period - 1) + gain) / period;
    losses = (losses * (period - 1) + loss) / period;
  }

  if (losses === 0) return 100;
  if (gains === 0) return 0;
  const rs = gains / losses;
  return +(100 - 100 / (1 + rs)).toFixed(2);
}

// --- Send Chrome + Telegram notifications ---
async function sendRSIAlert(symbol, interval, rsi) {
  const now = new Date();
  const bdtTime = now.toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const title = `[RSI Alert] ${symbol} (${interval})`;
  const message = `RSI: ${rsi}\nTime: ${bdtTime} BDT`;

  console.log(`[ALERT] ${title} → ${message}`);

  // Chrome notification
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title,
    message,
  });

  // Telegram message
  const { botToken, chatId } = CONFIG.telegram;
  if (botToken && chatId) {
    const telegramURL = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const text =
      `📊 *RSI Alert*\n` +
      `Symbol: *${symbol}*\n` +
      `Timeframe: *${interval}*\n` +
      `RSI: *${rsi}*\n` +
      `🕒 ${bdtTime} BDT`;

    await fetch(telegramURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
  }
}

// --- RSI Checker ---
async function checkRSI(pair) {
  try {
    const closes = await fetchKlines(
      pair.symbol,
      pair.interval,
      CONFIG.klinesLimit
    );
    const rsi = calculateRSI(closes, CONFIG.rsiPeriod);
    if (!rsi) return;

    const key = `${pair.symbol}_${pair.interval}`;
    const now = Date.now();
    const prevState = lastRSIState[key] || "neutral";
    const lastTime = lastAlertTime[key] || 0;
    const coolDownMs = CONFIG.coolDownMinutes * 60 * 1000;

    let newState = "neutral";
    let shouldAlert = false;

    if (rsi >= CONFIG.alertUpper) newState = "above70";
    else if (rsi <= CONFIG.alertLower) newState = "below30";

    // 1️⃣ Touch or cross 70/30
    if (
      newState !== prevState &&
      (newState === "above70" || newState === "below30")
    ) {
      shouldAlert = true;
    }

    // 2️⃣ If still above/below 70/30 for long (cooldown)
    else if (
      (newState === "above70" || newState === "below30") &&
      now - lastTime >= coolDownMs
    ) {
      shouldAlert = true;
    }

    if (shouldAlert) {
      await sendRSIAlert(pair.symbol, pair.interval, rsi);
      lastAlertTime[key] = now;
    }

    lastRSIState[key] = newState;

    console.log(
      `[${pair.symbol}] (${pair.interval}) RSI=${rsi}, State=${newState}`
    );
  } catch (err) {
    console.error("Error checking RSI:", pair.symbol, err);
  }
}

// --- Run all pairs ---
async function runAllChecks() {
  console.log("[RSI Alert] Checking RSI...");
  await Promise.all(CONFIG.pairs.map(checkRSI));
}

setInterval(runAllChecks, CONFIG.checkEverySeconds * 1000);
runAllChecks();
