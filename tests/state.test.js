const StateManager = require('../lib/state');

describe('StateManager', () => {
  let stateManager;
  let mockConfig;

  beforeEach(() => {
    mockConfig = {
      get: jest.fn(),
      set: jest.fn()
    };
    stateManager = new StateManager(mockConfig);
  });

  test('initializes with disabled state by default', () => {
    mockConfig.get.mockReturnValue(undefined);

    const isEnabled = stateManager.isEnabled();

    expect(isEnabled).toBe(false);
    expect(mockConfig.get).toHaveBeenCalledWith('discord.presence.enabled');
  });

  test('enables state and persists to config', () => {
    stateManager.setEnabled(true);

    expect(stateManager.isEnabled()).toBe(true);
    expect(mockConfig.set).toHaveBeenCalledWith('discord.presence.enabled', true);
  });

  test('disables state and persists to config', () => {
    stateManager.setEnabled(false);

    expect(stateManager.isEnabled()).toBe(false);
    expect(mockConfig.set).toHaveBeenCalledWith('discord.presence.enabled', false);
  });

  test('loads existing enabled state from config', () => {
    mockConfig.get.mockReturnValue(true);
    const newStateManager = new StateManager(mockConfig);

    expect(newStateManager.isEnabled()).toBe(true);
  });

  test('resets cached state', () => {
    stateManager.setEnabled(true);
    stateManager.reset();
    mockConfig.get.mockReturnValue(false);

    const isEnabled = stateManager.isEnabled();

    expect(isEnabled).toBe(false);
  });
});
