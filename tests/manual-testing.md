# Manual Testing Guide

## Pre-requisites
- Discord desktop app installed and running
- Claude Code with plugin system enabled
- This plugin installed and loaded

## Test Cases

### Test 1: Enable Discord Status
1. Run `/discord-status on` in Claude Code
2. **Expected**: Success message appears
3. **Expected**: Discord profile shows "Playing Claude Code" activity
4. **Expected**: Activity details show "Using Claude Code"

### Test 2: Disable Discord Status
1. Run `/discord-status off` in Claude Code
2. **Expected**: Success message appears
3. **Expected**: Discord activity disappears from profile

### Test 3: State Persistence
1. Run `/discord-status on`
2. Close and restart Claude Code
3. **Expected**: Discord activity automatically restored
4. Run `/discord-status off`
5. Close and restart Claude Code
6. **Expected**: Discord activity remains off

### Test 4: Discord Not Running
1. Close Discord completely
2. Run `/discord-status on`
3. **Expected**: Error message about Discord not being detected
4. Start Discord and try again
5. **Expected**: Command succeeds

### Test 5: Status Command
1. Run `/discord-status status`
2. **Expected**: Current enabled/disabled state is displayed

### Test 6: Invalid Commands
1. Run `/discord-status`
2. **Expected**: Usage help displayed with `on`, `off`, and `status`
3. Run `/discord-status invalid`
4. **Expected**: Usage help displayed

### Test 7: Rapid Toggle
1. Run `/discord-status on`
2. Immediately run `/discord-status off`
3. Immediately run `/discord-status on`
4. **Expected**: All commands succeed, final state is enabled

## Success Criteria
- All commands respond within 1 second
- Discord activity accurately reflects plugin state
- No error messages during normal operation
- State persists across restarts
- Graceful handling of Discord unavailability
