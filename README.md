RSI Alert - Chrome Extension

This is a simple Chrome extension that checks the RSI (Relative Strength Index) value for BTCUSDT and ETHUSDT from Binance API. It monitors 3 minute, 5 minute, and 15 minute time frames.

The goal of this project is to get instant alerts when RSI touches or crosses 30 or 70 levels. These are common overbought and oversold zones used in trading.

The extension sends notifications in two ways:

1. Local Chrome notifications on your computer
2. Telegram message alerts using your bot

Main features:

* Checks every 10 seconds
* Calculates RSI 14 based on Binance data
* Sends alert only when RSI touches or crosses 30 or 70
* Also alerts if RSI stays above 70 or below 30 for more than 2 minutes
* Works with 3m, 5m, and 15m timeframes
* Shows time in BDT format
* Logs all data in Chrome console

How to use:

1. Clone or download the project.
2. Open Chrome and go to chrome://extensions
3. Turn on Developer Mode.
4. Click "Load unpacked" and select the project folder.
5. Add your Telegram bot token and chat ID in background.js
6. The extension will start checking automatically.

This is made for Trader;You can add more feauture 

Created by Newton Bepari in 2025.
