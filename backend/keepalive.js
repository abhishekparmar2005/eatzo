/**
 * Eatzo Keepalive — prevents Render free tier from sleeping
 * Pings the server's own health endpoint every 9 minutes.
 * Only runs in production (NODE_ENV=production).
 */

const https = require('https');
const http = require('http');

const PING_INTERVAL_MS = 9 * 60 * 1000; // 9 minutes

const keepAlive = () => {
  const appUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL;

  if (!appUrl) {
    console.log('[Keepalive] No RENDER_EXTERNAL_URL set — skipping self-ping.');
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Keepalive] Not in production — self-ping disabled.');
    return;
  }

  const pingUrl = `${appUrl}/health`;
  const client = pingUrl.startsWith('https') ? https : http;

  const ping = () => {
    client.get(pingUrl, (res) => {
      console.log(`[Keepalive] ✅ Self-ping OK — status ${res.statusCode} at ${new Date().toISOString()}`);
    }).on('error', (err) => {
      console.error(`[Keepalive] ❌ Self-ping failed: ${err.message}`);
    });
  };

  // First ping after 1 minute, then every 9 minutes
  setTimeout(() => {
    ping();
    setInterval(ping, PING_INTERVAL_MS);
  }, 60 * 1000);

  console.log(`[Keepalive] 🟢 Started — pinging ${pingUrl} every 9 minutes`);
};

module.exports = keepAlive;
