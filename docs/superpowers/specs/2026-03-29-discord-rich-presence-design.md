# Discord Rich Presence Plugin Design Specification

**Date:** 2026-03-29
**Project:** Claude Code Discord Rich Presence Plugin
**Type:** MVP Implementation

## Overview

A Claude Code plugin that provides manual Discord Rich Presence integration, allowing users to display "Using Claude Code" as their Discord activity status through simple commands.

## Requirements

### Functional Requirements
- Manual control via `/discord-status on` and `/discord-status off` commands
- Display "Using Claude Code" activity in Discord when enabled
- State persistence across Claude Code sessions
- Clean integration with Claude Code's plugin system
- Graceful error handling when Discord is unavailable

### Non-Functional Requirements
- Response time < 1 second for commands
- Memory usage < 5MB
- No impact on Claude Code performance
- Cross-platform compatibility (Windows, macOS, Linux)
- No user configuration required beyond commands

## Architecture

### High-Level Design
The plugin consists of four main components working together:

1. **Plugin Entry Point** - Claude Code plugin interface implementation
2. **Rich Presence Manager** - Discord connection and status management
3. **State Manager** - Persistence and state tracking
4. **Command Handlers** - User command processing

### Component Details

#### PresenceManager (lib/presence.js)
- Wraps discord-rpc client functionality
- Manages connection lifecycle to Discord
- Sets activity status to "Using Claude Code"
- Handles connection errors and reconnection logic
- Provides clean disconnect functionality

#### CommandHandler (lib/commands.js)
- Registers `/discord-status` command with Claude Code
- Processes `on` and `off` subcommands
- Provides user feedback messages
- Validates command arguments and state

#### StateManager (lib/state.js)
- Tracks enabled/disabled state
- Persists settings using Claude Code's config system
- Manages graceful cleanup on shutdown
- Handles state recovery on plugin load

#### Main Plugin (index.js)
- Implements Claude Code plugin interface
- Coordinates component interactions
- Handles plugin lifecycle events (load/unload)
- Manages error propagation and logging

## Technical Implementation

### Dependencies
```json
{
  "discord-rpc": "^4.0.1"
}
```

### File Structure
```
claude-discord-presence/
├── package.json          # Dependencies and metadata
├── index.js             # Main plugin entry point
├── lib/
│   ├── presence.js      # Rich Presence manager
│   ├── commands.js      # Command handlers
│   └── state.js         # State management
└── README.md           # Setup instructions
```

### Discord Integration
- Uses pre-configured Discord application
- Application name: "Claude Code"
- Activity text: "Using Claude Code"
- No user setup required for Discord application
- Communicates via Discord's local IPC protocol

### Data Flow

#### Activation Flow
1. User executes `/discord-status on`
2. CommandHandler validates request
3. StateManager updates enabled state
4. PresenceManager establishes Discord connection
5. Activity appears in Discord
6. Success feedback sent to user

#### Deactivation Flow
1. User executes `/discord-status off`
2. CommandHandler validates request
3. PresenceManager disconnects from Discord
4. StateManager updates disabled state
5. Activity disappears from Discord
6. Success feedback sent to user

## Error Handling

### Error Scenarios
- **Discord Not Running:** Display helpful message suggesting user start Discord
- **Connection Failed:** Retry logic with backoff, inform user if persistent
- **Invalid Command:** Show usage help for `/discord-status` command
- **Already Active/Inactive:** Friendly status message instead of error

### Recovery Strategies
- Auto-reconnect on Discord restart
- State recovery on plugin reload
- Graceful degradation when Discord unavailable
- Clean shutdown without Discord artifacts

## User Experience

### Command Interface
```
/discord-status on   # Enable Discord activity
/discord-status off  # Disable Discord activity
```

### User Feedback
- **Enable Success:** "✅ Discord status enabled - now showing 'Using Claude Code'"
- **Disable Success:** "❌ Discord status disabled"
- **Discord Not Found:** "Discord desktop app not detected. Please start Discord and try again."
- **Connection Error:** "Failed to connect to Discord. Try restarting Discord."

### Discord Display
Friends see in Discord activity:
- **Application:** "Claude Code"
- **Details:** "Using Claude Code"
- **Large Image:** Claude Code icon/logo

## Configuration

### Plugin Configuration
- Enabled/disabled state stored in Claude Code config
- Discord application ID embedded in plugin
- No external configuration files required

### Default Behavior
- Plugin loads in disabled state
- Remembers last user setting across sessions
- Auto-cleanup on Claude Code exit

## Testing Strategy

### Manual Testing
- Command execution and response validation
- Discord activity appearance/disappearance
- State persistence across restarts
- Error handling when Discord unavailable

### Edge Case Testing
- Discord start/stop while plugin active
- Multiple Claude Code sessions
- Rapid enable/disable cycling
- Force quit scenarios

### Success Criteria
- Commands respond within 1 second
- No error messages during normal operation
- Accurate Discord activity display
- No memory leaks during extended use
- Clean plugin unload

## Future Enhancements (Out of Scope for MVP)

- Display current file being edited
- Show project name in activity
- Custom status message templates
- Activity timestamps
- Integration with Claude Code themes/icons

## Implementation Notes

### Security Considerations
- No sensitive data transmitted
- Uses standard Discord Rich Presence protocol
- Local IPC communication only
- No external network dependencies

### Performance Considerations
- Event-driven architecture (no polling)
- Minimal memory footprint
- Connection only when active
- Efficient state management

### Compatibility
- Works with Discord desktop app
- Compatible with all Claude Code supported platforms
- No dependency on specific Discord client versions