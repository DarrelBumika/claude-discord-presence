# Claude Code Discord Rich Presence Plugin

Show your Claude Code activity in Discord with manual control.

## Features

- Manual Discord Rich Presence control via `/discord-status on/off` commands
- Shows "Using Claude Code" activity when enabled
- State persistence across Claude Code sessions
- Graceful error handling when Discord is unavailable

## Installation

1. Copy this plugin to your Claude Code plugins directory
2. Install dependencies: `npm install`
3. Restart Claude Code
4. The plugin will be automatically loaded

## Usage

### Enable Discord Status
```
/discord-status on
```
Shows "Using Claude Code" in your Discord activity.

### Disable Discord Status
```
/discord-status off
```
Removes the activity from your Discord profile.

## Requirements

- Discord desktop application must be running
- Node.js 16.0.0 or higher
- Claude Code plugin system

## Troubleshooting

### "Discord desktop app not detected"
- Make sure Discord is running and logged in
- Restart Discord and try again
- Check that Discord isn't running in browser-only mode

### "Failed to connect to Discord"
- Try restarting Discord
- Make sure no other Discord Rich Presence applications are conflicting
- Check Discord's Activity Settings (User Settings > Activity Privacy)

### Plugin doesn't load
- Verify Node.js version with `node --version`
- Run `npm install` in the plugin directory
- Check Claude Code logs for error messages

## Development

### Running Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Plugin Structure
- `index.js` - Main plugin entry point
- `lib/presence.js` - Discord Rich Presence manager
- `lib/commands.js` - Command handlers
- `lib/state.js` - State management and persistence

## License

MIT
