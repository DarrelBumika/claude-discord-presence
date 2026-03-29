const PresenceManager = require('./lib/presence');
const StateManager = require('./lib/state');
const CommandHandler = require('./lib/commands');

class DiscordPresencePlugin {
  constructor() {
    this.presenceManager = null;
    this.stateManager = null;
    this.commandHandler = null;
    this.claudeAPI = null;
  }

  onLoad(claudeAPI) {
    this.claudeAPI = claudeAPI;

    // Initialize components
    this.presenceManager = new PresenceManager();
    this.stateManager = new StateManager(claudeAPI.config);
    this.commandHandler = new CommandHandler(
      this.presenceManager,
      this.stateManager,
      claudeAPI
    );

    // Register commands
    this.commandHandler.register();

    // Auto-enable if previously enabled
    this.restoreState();
  }

  async restoreState() {
    if (this.stateManager.isEnabled()) {
      try {
        await this.presenceManager.connect();
        await this.presenceManager.setActivity();
      } catch (error) {
        // Silently fail restore - user can manually re-enable
        this.stateManager.setEnabled(false);
      }
    }
  }

  onUnload() {
    if (this.presenceManager) {
      this.presenceManager.disconnect();
    }
  }

  getMetadata() {
    return {
      name: 'Discord Rich Presence',
      description: 'Show Claude Code activity in Discord',
      version: '1.0.0',
      author: 'Claude Code Community'
    };
  }
}

module.exports = DiscordPresencePlugin;
