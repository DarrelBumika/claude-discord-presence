const CommandHandler = require('../lib/commands');

describe('CommandHandler', () => {
  let commandHandler;
  let mockPresenceManager;
  let mockStateManager;
  let mockClaudeAPI;

  beforeEach(() => {
    mockPresenceManager = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      setActivity: jest.fn(),
      isConnected: jest.fn()
    };

    mockStateManager = {
      isEnabled: jest.fn(),
      setEnabled: jest.fn()
    };

    mockClaudeAPI = {
      registerCommand: jest.fn(),
      sendMessage: jest.fn()
    };

    commandHandler = new CommandHandler(mockPresenceManager, mockStateManager, mockClaudeAPI);
  });

  test('registers discord-status command', () => {
    commandHandler.register();

    expect(mockClaudeAPI.registerCommand).toHaveBeenCalledWith(
      'discord-status',
      expect.any(Function),
      expect.objectContaining({
        description: expect.any(String),
        usage: '/discord-status <on|off|status>'
      })
    );
  });

  test('enables Discord status successfully', async () => {
    mockStateManager.isEnabled.mockReturnValue(false);
    mockPresenceManager.connect.mockResolvedValue();
    mockPresenceManager.setActivity.mockResolvedValue();

    const result = await commandHandler.handleCommand(['on']);

    expect(mockPresenceManager.connect).toHaveBeenCalled();
    expect(mockPresenceManager.setActivity).toHaveBeenCalled();
    expect(mockStateManager.setEnabled).toHaveBeenCalledWith(true);
    expect(result).toBe("✅ Discord status enabled - now showing 'Using Claude Code'");
  });

  test('disables Discord status successfully', async () => {
    mockStateManager.isEnabled.mockReturnValue(true);
    mockPresenceManager.disconnect.mockResolvedValue();

    const result = await commandHandler.handleCommand(['off']);

    expect(mockPresenceManager.disconnect).toHaveBeenCalled();
    expect(mockStateManager.setEnabled).toHaveBeenCalledWith(false);
    expect(result).toBe("❌ Discord status disabled");
  });

  test('handles connection errors gracefully', async () => {
    mockStateManager.isEnabled.mockReturnValue(false);
    mockPresenceManager.connect.mockRejectedValue(new Error('Discord not running'));

    const result = await commandHandler.handleCommand(['on']);

    expect(result).toBe("❌ Failed to enable Discord status: Discord not running");
  });

  test('returns already enabled when status is already on', async () => {
    mockStateManager.isEnabled.mockReturnValue(true);

    const result = await commandHandler.handleCommand(['on']);

    expect(result).toBe('ℹ️ Discord status is already enabled');
    expect(mockPresenceManager.connect).not.toHaveBeenCalled();
    expect(mockPresenceManager.setActivity).not.toHaveBeenCalled();
    expect(mockStateManager.setEnabled).not.toHaveBeenCalled();
  });

  test('returns already disabled when status is already off', async () => {
    mockStateManager.isEnabled.mockReturnValue(false);

    const result = await commandHandler.handleCommand(['off']);

    expect(result).toBe('ℹ️ Discord status is already disabled');
    expect(mockPresenceManager.disconnect).not.toHaveBeenCalled();
    expect(mockStateManager.setEnabled).not.toHaveBeenCalled();
  });

  test('reports enabled status', async () => {
    mockStateManager.isEnabled.mockReturnValue(true);

    const result = await commandHandler.handleCommand(['status']);

    expect(result).toBe('ℹ️ Discord status is currently enabled');
  });

  test('reports disabled status', async () => {
    mockStateManager.isEnabled.mockReturnValue(false);

    const result = await commandHandler.handleCommand(['status']);

    expect(result).toBe('ℹ️ Discord status is currently disabled');
  });

  test('shows usage for invalid commands', async () => {
    const result = await commandHandler.handleCommand(['invalid']);

    expect(result).toContain('Usage: /discord-status <on|off|status>');
  });

  test('shows usage for no arguments', async () => {
    const result = await commandHandler.handleCommand([]);

    expect(result).toContain('Usage: /discord-status <on|off|status>');
  });
});
