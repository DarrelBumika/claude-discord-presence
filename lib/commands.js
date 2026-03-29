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
        usage: '/discord-status <on|off>'
      }
    );
  }

  async handleCommand(args) {
    const action = args && args[0];

    if (action === 'on') {
      return await this.enableStatus();
    } else if (action === 'off') {
      return await this.disableStatus();
    } else {
      return this.showUsage();
    }
  }

  async enableStatus() {
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
    try {
      await this.presenceManager.disconnect();
      this.stateManager.setEnabled(false);
      return "❌ Discord status disabled";
    } catch (error) {
      return `❌ Failed to disable Discord status: ${error.message}`;
    }
  }

  showUsage() {
    return "Usage: /discord-status <on|off>\n\non  - Enable Discord Rich Presence\noff - Disable Discord Rich Presence";
  }
}

module.exports = CommandHandler;
