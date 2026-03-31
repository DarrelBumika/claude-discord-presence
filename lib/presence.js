const RPC = require('discord-rpc');

class PresenceManager {
  constructor() {
    this.client = null;
    this.connected = false;
    // Discord application ID for Claude Code
    this.clientId = '1234567890123456789'; // Pre-configured Discord app ID
  }

  async connect() {
    if (this.connected && this.client) {
      return;
    }

    const client = new RPC.Client({ transport: 'ipc' });

    client.on('ready', () => {
      this.connected = true;
    });

    client.on('disconnected', () => {
      this.connected = false;
      this.client = null;
    });

    this.client = client;

    try {
      await client.login({ clientId: this.clientId });
      this.connected = true;
    } catch (error) {
      this.connected = false;
      this.client = null;

      try {
        client.destroy();
      } catch {
        // ignore disconnect errors during failed login cleanup
      }

      throw error;
    }
  }

  isConnected() {
    return this.connected;
  }

  async setActivity() {
    if (!this.connected || !this.client) {
      throw new Error('Not connected to Discord');
    }

    await this.client.setActivity({
      state: 'Using Claude Code',
      details: 'Writing code',
      largeImageKey: 'claude_code_logo',
      largeImageText: 'Claude Code',
      instance: true,
      startTimestamp: Date.now()
    });
  }

  async disconnect() {
    if (!this.client) {
      this.connected = false;
      return;
    }

    const client = this.client;
    this.client = null;
    this.connected = false;

    if (typeof client.clearActivity === 'function') {
      try {
        await client.clearActivity();
      } catch {
        // ignore clear activity failures while disconnecting
      }
    }

    client.destroy();
  }
}

module.exports = PresenceManager;
