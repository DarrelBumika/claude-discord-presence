class StateManager {
  constructor(config) {
    this.config = config;
    this._enabled = null;
  }

  isEnabled() {
    if (this._enabled === null) {
      this._enabled = this.config.get('discord.presence.enabled') || false;
    }
    return this._enabled;
  }

  setEnabled(enabled) {
    this._enabled = enabled;
    this.config.set('discord.presence.enabled', enabled);
  }

  reset() {
    this._enabled = null;
  }
}

module.exports = StateManager;
