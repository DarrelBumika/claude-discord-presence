const PresenceManager = require('../lib/presence');

// Mock discord-rpc
jest.mock('discord-rpc', () => ({
  register: jest.fn(),
  Client: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    login: jest.fn(),
    setActivity: jest.fn(),
    clearActivity: jest.fn(),
    destroy: jest.fn()
  }))
}));

describe('PresenceManager', () => {
  let presenceManager;
  let mockClient;
  const RPC = require('discord-rpc');

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = new RPC.Client();
    RPC.Client.mockImplementation(() => mockClient);
    presenceManager = new PresenceManager();
  });

  test('connects to Discord successfully', async () => {
    mockClient.login.mockResolvedValue();

    await presenceManager.connect();

    expect(mockClient.login).toHaveBeenCalledWith({ clientId: expect.any(String) });
    expect(presenceManager.isConnected()).toBe(true);
  });

  test('sets activity when connected', async () => {
    mockClient.login.mockResolvedValue();
    mockClient.setActivity.mockResolvedValue();

    await presenceManager.connect();
    await presenceManager.setActivity();

    expect(mockClient.setActivity).toHaveBeenCalledWith({
      state: 'Using Claude Code',
      details: 'Writing code',
      largeImageKey: 'claude_code_logo',
      largeImageText: 'Claude Code',
      instance: true,
      startTimestamp: expect.any(Number)
    });
  });

  test('throws error when setting activity while disconnected', async () => {
    await expect(presenceManager.setActivity()).rejects.toThrow('Not connected to Discord');
  });

  test('disconnects cleanly', async () => {
    mockClient.login.mockResolvedValue();
    await presenceManager.connect();

    await presenceManager.disconnect();

    expect(mockClient.destroy).toHaveBeenCalled();
    expect(presenceManager.isConnected()).toBe(false);
  });

  test('handles connection errors gracefully', async () => {
    mockClient.login.mockRejectedValue(new Error('Discord not running'));

    await expect(presenceManager.connect()).rejects.toThrow('Discord not running');
    expect(presenceManager.isConnected()).toBe(false);
  });

  test('cleans up client on failed connection', async () => {
    mockClient.login.mockRejectedValue(new Error('Discord not running'));

    await expect(presenceManager.connect()).rejects.toThrow('Discord not running');

    expect(presenceManager.client).toBeNull();
    expect(presenceManager.isConnected()).toBe(false);
  });

  test('clears activity before disconnecting', async () => {
    mockClient.login.mockResolvedValue();
    mockClient.clearActivity.mockResolvedValue();

    await presenceManager.connect();
    await presenceManager.disconnect();

    expect(mockClient.clearActivity).toHaveBeenCalledTimes(1);
    expect(mockClient.destroy).toHaveBeenCalledTimes(1);
  });

  test('prevents duplicate connections', async () => {
    mockClient.login.mockResolvedValue();

    await presenceManager.connect();
    await presenceManager.connect();

    expect(mockClient.login).toHaveBeenCalledTimes(1);
  });
});
