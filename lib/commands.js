class CommandHandler {
  constructor(presenceManager, stateManager, claudeAPI) {
    this.presenceManager = presenceManager;
    this.stateManager = stateManager;
    this.claudeAPI = claudeAPI;
  }

  register() {
    this.claudeAPI.registerCommand(
      'discord-status',
      this.handleCommand.bind(this),
      {
        description: 'Control Discord Rich Presence status',
        usage: '/discord-status <on|off|status>'
      }
    );
  }

  async handleCommand(args) {
    const action = args && args[0];

    if (action === 'on') {
      return await this.enableStatus();
    } else if (action === 'off') {
      return await this.disableStatus();
    } else if (action === 'status') {
      return this.getStatus();
    } else {
      return this.showUsage();
    }
  }

  async enableStatus() {
    if (this.stateManager.isEnabled()) {
      return 'ℹ️ Discord status is already enabled';
    }

    try {
      await this.presenceManager.connect();
      await this.presenceManager.setActivity();
      this.stateManager.setEnabled(true);
      return "✅ Discord status enabled - now showing 'Using Claude Code'";
    } catch (error) {
      return `❌ Failed to enable Discord status: ${error.message}`;
    }
  }

  async disableStatus() {
    if (!this.stateManager.isEnabled()) {
      return 'ℹ️ Discord status is already disabled';
    }

    try {
      await this.presenceManager.disconnect();
      this.stateManager.setEnabled(false);
      return "❌ Discord status disabled";
    } catch (error) {
      return `❌ Failed to disable Discord status: ${error.message}`;
    }
  }

  getStatus() {
    if (this.stateManager.isEnabled()) {
      return 'ℹ️ Discord status is currently enabled';
    }

    return 'ℹ️ Discord status is currently disabled';
  }

  showUsage() {
    return "Usage: /discord-status <on|off|status>\n\non     - Enable Discord Rich Presence\noff    - Disable Discord Rich Presence\nstatus - Show current Discord Rich Presence state";
  }
}

module.exports = CommandHandler;
