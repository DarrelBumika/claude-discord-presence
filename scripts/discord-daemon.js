const fs = require('node:fs');
const path = require('node:path');
const PresenceManager = require('../lib/presence');

const runtimeDir = path.join(__dirname, '..', '.claude-plugin', '.runtime');
const statusFilePath = path.join(runtimeDir, 'status.json');

function ensureRuntimeDir() {
  fs.mkdirSync(runtimeDir, { recursive: true });
}

function writeStatus(state, errorMessage = null) {
  ensureRuntimeDir();
  fs.writeFileSync(
    statusFilePath,
    JSON.stringify(
      {
        state,
        error: errorMessage,
        updatedAt: new Date().toISOString(),
        pid: process.pid
      },
      null,
      2
    )
  );
}

async function main() {
  const presenceManager = new PresenceManager();
  writeStatus('starting');

  try {
    await presenceManager.connect();
    await presenceManager.setActivity();
    writeStatus('enabled');
  } catch (error) {
    writeStatus('error', error.message);
    process.exit(1);
  }

  const heartbeat = setInterval(() => {
    writeStatus('enabled');
  }, 15000);

  async function shutdown() {
    clearInterval(heartbeat);
    try {
      await presenceManager.disconnect();
    } catch {
      // ignore disconnect errors during shutdown
    }
    writeStatus('disabled');
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  writeStatus('error', error.message);
  process.exit(1);
});
