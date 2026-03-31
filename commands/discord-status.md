---
description: Control Discord Rich Presence status
argument-hint: <on|off|status>
allowed-tools:
  - Bash(node scripts/discord-status.js:*)
---

Run the Discord status command using the first token from `$ARGUMENTS`.

Rules:
1. If no argument is provided, use `status`.
2. Run exactly one command:
   - `node scripts/discord-status.js <action>`
3. Return the command output as-is without extra commentary.
