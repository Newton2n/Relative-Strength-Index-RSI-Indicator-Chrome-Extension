
RSI Alert Chrome Extension
==========================

What it does:
- Monitors RSI (14) for BTCUSDT and ETHUSDT on 5m and 15m intervals using Binance klines.
- Sends a browser notification when RSI enters Oversold (<=30) or Overbought (>=70).
- Checks every 1 minute (configurable in background.js).

How to install (Developer mode):
1. Download and unzip the extension.
2. In Chrome go to chrome://extensions
3. Toggle "Developer mode" on (top-right).
4. Click "Load unpacked" and choose the folder named rsi_alert_extension.
5. The extension will start running; allow notifications when prompted.

Files included:
- manifest.json
- background.js
- icon.png

Notes:
- Uses Binance public API (no API key required). Respect Binance rate limits.
- This is a simple utility for personal use.
