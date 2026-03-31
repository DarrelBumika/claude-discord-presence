#!/usr/bin/env node

const RuntimeControl = require('../lib/runtime-control');

function parseAction(rawArg) {
  const action = (rawArg || '').trim().toLowerCase();
  return action || 'status';
}

function printUsage() {
  console.log('Usage: /discord-status <on|off|status>');
}

async function run() {
  const control = new RuntimeControl();
  const action = parseAction(process.argv[2]);

  if (action === 'on') {
    const result = await control.enable();
    if (result.changed) {
      console.log("✅ Discord status enabled - now showing 'Using Claude Code'");
    } else {
      console.log('ℹ️ Discord status is already enabled');
    }
    return;
  }

  if (action === 'off') {
    const result = await control.disable();
    if (result.changed) {
      console.log('❌ Discord status disabled');
    } else {
      console.log('ℹ️ Discord status is already disabled');
    }
    return;
  }

  if (action === 'status') {
    const result = await control.status();
    if (result.enabled) {
      console.log('ℹ️ Discord status is currently enabled');
    } else {
      console.log('ℹ️ Discord status is currently disabled');
    }
    return;
  }

  printUsage();
  process.exitCode = 1;
}

run().catch((error) => {
  console.error(`❌ Failed to update Discord status: ${error.message}`);
  process.exitCode = 1;
});
