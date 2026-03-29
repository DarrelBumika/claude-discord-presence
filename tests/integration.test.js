const DiscordPresencePlugin = require('../index');

// Mock all dependencies
jest.mock('../lib/presence');
jest.mock('../lib/state');
jest.mock('../lib/commands');

describe('DiscordPresencePlugin Integration', () => {
  let plugin;
  let mockClaudeAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClaudeAPI = {
      registerCommand: jest.fn(),
      sendMessage: jest.fn(),
      config: {
        get: jest.fn(),
        set: jest.fn()
      }
    };

    plugin = new DiscordPresencePlugin();
  });

  test('initializes all components on load', () => {
    plugin.onLoad(mockClaudeAPI);

    expect(plugin.presenceManager).toBeDefined();
    expect(plugin.stateManager).toBeDefined();
    expect(plugin.commandHandler).toBeDefined();
  });

  test('restores enabled state on load', async () => {
    const StateManager = require('../lib/state');
    const PresenceManager = require('../lib/presence');

    const mockStateManager = new StateManager();
    const mockPresenceManager = new PresenceManager();

    mockStateManager.isEnabled = jest.fn().mockReturnValue(true);
    mockPresenceManager.connect = jest.fn().mockResolvedValue();
    mockPresenceManager.setActivity = jest.fn().mockResolvedValue();

    StateManager.mockImplementation(() => mockStateManager);
    PresenceManager.mockImplementation(() => mockPresenceManager);

    plugin.onLoad(mockClaudeAPI);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockPresenceManager.connect).toHaveBeenCalled();
    expect(mockPresenceManager.setActivity).toHaveBeenCalled();
  });

  test('handles restore errors gracefully', async () => {
    const StateManager = require('../lib/state');
    const PresenceManager = require('../lib/presence');

    const mockStateManager = new StateManager();
    const mockPresenceManager = new PresenceManager();

    mockStateManager.isEnabled = jest.fn().mockReturnValue(true);
    mockStateManager.setEnabled = jest.fn();
    mockPresenceManager.connect = jest.fn().mockRejectedValue(new Error('Discord not running'));

    StateManager.mockImplementation(() => mockStateManager);
    PresenceManager.mockImplementation(() => mockPresenceManager);

    plugin.onLoad(mockClaudeAPI);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockStateManager.setEnabled).toHaveBeenCalledWith(false);
  });

  test('cleans up on unload', () => {
    plugin.onLoad(mockClaudeAPI);
    const mockDisconnect = jest.fn();
    plugin.presenceManager.disconnect = mockDisconnect;

    plugin.onUnload();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  test('provides correct metadata', () => {
    const metadata = plugin.getMetadata();

    expect(metadata.name).toBe('Discord Rich Presence');
    expect(metadata.description).toContain('Discord');
    expect(metadata.version).toBe('1.0.0');
  });
});
