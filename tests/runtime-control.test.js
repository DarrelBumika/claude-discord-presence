const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const RuntimeControl = require('../lib/runtime-control');

describe('RuntimeControl', () => {
  let runtimeDir;
  let runningPids;
  let spawnMock;
  let killMock;

  beforeEach(() => {
    runtimeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'discord-runtime-'));
    runningPids = new Set();

    spawnMock = jest.fn(() => {
      const pid = 4321;
      runningPids.add(pid);
      return {
        pid,
        unref: jest.fn()
      };
    });

    killMock = jest.fn((pid, signal) => {
      if (signal === 0) {
        if (!runningPids.has(pid)) {
          const error = new Error('ESRCH');
          error.code = 'ESRCH';
          throw error;
        }
        return;
      }

      runningPids.delete(pid);
    });
  });

  test('reports disabled status when pid file does not exist', async () => {
    const control = new RuntimeControl({
      runtimeDir,
      daemonScriptPath: '/fake/daemon.js',
      spawnImpl: spawnMock,
      killImpl: killMock,
      sleepImpl: async () => {}
    });

    await expect(control.status()).resolves.toEqual({ enabled: false, pid: null });
  });

  test('enables by spawning daemon and writing pid file', async () => {
    const control = new RuntimeControl({
      runtimeDir,
      daemonScriptPath: '/fake/daemon.js',
      spawnImpl: spawnMock,
      killImpl: killMock,
      sleepImpl: async () => {}
    });

    await expect(control.enable()).resolves.toEqual({ enabled: true, pid: 4321, changed: true });

    const pidFilePath = path.join(runtimeDir, 'daemon.pid');
    expect(fs.readFileSync(pidFilePath, 'utf8')).toBe('4321');
    expect(spawnMock).toHaveBeenCalled();
  });

  test('returns unchanged when already enabled', async () => {
    const control = new RuntimeControl({
      runtimeDir,
      daemonScriptPath: '/fake/daemon.js',
      spawnImpl: spawnMock,
      killImpl: killMock,
      sleepImpl: async () => {}
    });

    fs.writeFileSync(path.join(runtimeDir, 'daemon.pid'), '4321');
    runningPids.add(4321);

    await expect(control.enable()).resolves.toEqual({ enabled: true, pid: 4321, changed: false });
    expect(spawnMock).not.toHaveBeenCalled();
  });

  test('disables by terminating daemon and clearing pid file', async () => {
    const control = new RuntimeControl({
      runtimeDir,
      daemonScriptPath: '/fake/daemon.js',
      spawnImpl: spawnMock,
      killImpl: killMock,
      sleepImpl: async () => {}
    });

    fs.writeFileSync(path.join(runtimeDir, 'daemon.pid'), '4321');
    runningPids.add(4321);

    await expect(control.disable()).resolves.toEqual({ enabled: false, pid: null, changed: true });
    expect(fs.existsSync(path.join(runtimeDir, 'daemon.pid'))).toBe(false);
  });
});
