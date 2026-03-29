const RPC = require('discord-rpc');

class PresenceManager {
  constructor() {
    this.client = null;
    this.connected = false;
    // Discord application ID for Claude Code
    this.clientId = '1234567890123456789'; // Pre-configured Discord app ID
  }

  async connect() {
    if (this.connected) {
      return;
    }

    this.client = new RPC.Client({ transport: 'ipc' });

    this.client.on('ready', () => {
      this.connected = true;
    });

    await this.client.login({ clientId: this.clientId });
    this.connected = true;
  }

  isConnected() {
    return this.connected;
  }

  async setActivity() {
    if (!this.connected || !this.client) {
      throw new Error('Not connected to Discord');
    }

    await this.client.setActivity({
      details: 'Using Claude Code',
      largeImageKey: 'claude-logo',
      largeImageText: 'Claude Code'
    });
  }

  async disconnect() {
    if (this.client) {
      this.client.destroy();
      this.client = null;
      this.connected = false;
    }
  }
}

module.exports = PresenceManager;
