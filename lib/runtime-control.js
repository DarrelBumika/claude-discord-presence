const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

class RuntimeControl {
  constructor(options = {}) {
    this.runtimeDir = options.runtimeDir || path.join(__dirname, '..', '.claude-plugin', '.runtime');
    this.daemonScriptPath = options.daemonScriptPath || path.join(__dirname, '..', 'scripts', 'discord-daemon.js');
    this.spawnImpl = options.spawnImpl || spawn;
    this.killImpl = options.killImpl || ((pid, signal) => process.kill(pid, signal));
    this.sleepImpl = options.sleepImpl || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    this.pidFilePath = path.join(this.runtimeDir, 'daemon.pid');
  }

  ensureRuntimeDir() {
    fs.mkdirSync(this.runtimeDir, { recursive: true });
  }

  readPid() {
    if (!fs.existsSync(this.pidFilePath)) {
      return null;
    }

    const raw = fs.readFileSync(this.pidFilePath, 'utf8').trim();
    const pid = Number.parseInt(raw, 10);

    if (!Number.isInteger(pid) || pid <= 0) {
      this.clearPid();
      return null;
    }

    return pid;
  }

  writePid(pid) {
    this.ensureRuntimeDir();
    fs.writeFileSync(this.pidFilePath, String(pid));
  }

  clearPid() {
    if (fs.existsSync(this.pidFilePath)) {
      fs.unlinkSync(this.pidFilePath);
    }
  }

  isProcessRunning(pid) {
    if (!Number.isInteger(pid) || pid <= 0) {
      return false;
    }

    try {
      this.killImpl(pid, 0);
      return true;
    } catch {
      return false;
    }
  }

  async status() {
    const pid = this.readPid();

    if (pid !== null && this.isProcessRunning(pid)) {
      return { enabled: true, pid };
    }

    if (pid !== null) {
      this.clearPid();
    }

    return { enabled: false, pid: null };
  }

  async enable() {
    const current = await this.status();
    if (current.enabled) {
      return { enabled: true, pid: current.pid, changed: false };
    }

    this.ensureRuntimeDir();

    const child = this.spawnImpl(process.execPath, [this.daemonScriptPath], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });

    if (!child || !child.pid) {
      throw new Error('Failed to start Discord presence daemon');
    }

    if (typeof child.unref === 'function') {
      child.unref();
    }

    this.writePid(child.pid);
    await this.sleepImpl(300);

    if (!this.isProcessRunning(child.pid)) {
      this.clearPid();
      throw new Error('Failed to start Discord presence daemon');
    }

    return { enabled: true, pid: child.pid, changed: true };
  }

  async disable() {
    const pid = this.readPid();

    if (pid === null) {
      return { enabled: false, pid: null, changed: false };
    }

    if (this.isProcessRunning(pid)) {
      try {
        this.killImpl(pid, 'SIGTERM');
      } catch (error) {
        if (!error || error.code !== 'ESRCH') {
          throw error;
        }
      }

      await this.sleepImpl(100);
    }

    this.clearPid();

    return { enabled: false, pid: null, changed: true };
  }
}

module.exports = RuntimeControl;
