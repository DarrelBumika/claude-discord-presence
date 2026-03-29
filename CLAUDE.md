# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains the **Discord Rich Presence Plugin** - a Claude Code plugin that enables users to display "Using Claude Code" as their Discord activity status. The project is in early planning/design phase with implementation specified but not yet executed.

**Current State:** Design specifications and implementation plan are complete; no code has been written yet.

## Quick Start Commands

### Project Setup
```bash
npm install              # Install dependencies (discord-rpc, jest)
npm test                 # Run full test suite
npm run test:watch      # Run tests in watch mode for development
```

### Running Specific Tests
```bash
npm test -- --testPathPattern=state.test.js      # Test state management
npm test -- --testPathPattern=presence.test.js   # Test presence manager
npm test -- --testPathPattern=commands.test.js   # Test command handlers
npm test -- --testPathPattern=integration.test.js # Test integration
```

### Development
```bash
node -e "const Plugin = require('./index'); const p = new Plugin(); console.log(p.getMetadata())"
# Verify plugin loads successfully
```

## Architecture Overview

The plugin follows a **modular component-based architecture** with clear separation of concerns:

### Four Main Components

1. **PresenceManager** (`lib/presence.js`)
   - Manages Discord Rich Presence client lifecycle
   - Handles connection/disconnection to Discord via IPC protocol
   - Sets and updates activity status ("Using Claude Code")
   - Provides error handling and connection state tracking
   - Uses discord-rpc library for low-level Discord communication

2. **StateManager** (`lib/state.js`)
   - Tracks enabled/disabled state in memory
   - Persists state to Claude Code config system
   - Loads previously saved state on initialization
   - Provides simple enable/disable interface

3. **CommandHandler** (`lib/commands.js`)
   - Registers the `/discord-status` command with Claude Code plugin API
   - Processes `on` and `off` subcommands
   - Coordinates state and presence manager changes
   - Provides user feedback messages
   - Includes error handling with user-friendly messages

4. **Main Plugin** (`index.js`)
   - Implements Claude Code plugin interface
   - Coordinates all components during plugin lifecycle
   - Handles plugin load (`onLoad`) and unload (`onUnload`) events
   - Restores previously enabled state on startup
   - Provides plugin metadata (name, description, version)

### Data Flow

**Enable Flow:**
1. User runs `/discord-status on`
2. CommandHandler receives command
3. PresenceManager connects to local Discord via IPC
4. PresenceManager sets activity to "Using Claude Code"
5. StateManager persists enabled state to config
6. User receives success message

**Disable Flow:**
1. User runs `/discord-status off`
2. CommandHandler receives command
3. PresenceManager disconnects from Discord
4. StateManager updates state to disabled
5. Discord activity disappears
6. User receives confirmation message

## File Structure

```
claude-discord-presence/
├── index.js                    # Main plugin entry point, lifecycle management
├── package.json               # Dependencies and plugin metadata
├── README.md                  # User documentation and troubleshooting
├── lib/
│   ├── presence.js            # Discord Rich Presence manager
│   ├── commands.js            # Command handlers and user interface
│   └── state.js               # State management and persistence
└── tests/
    ├── state.test.js          # State manager tests
    ├── presence.test.js       # Presence manager tests
    ├── commands.test.js       # Command handler tests
    ├── integration.test.js     # Plugin integration tests
    └── manual-testing.md      # Manual testing guide
```

## Key Technical Decisions

### Discord Integration
- Uses **discord-rpc** library for Rich Presence support
- Communicates via **IPC protocol** (inter-process communication) - local only, no network calls
- Discord application ID embedded in code (no external config needed)
- Pre-configured Discord application: "Claude Code"

### State Persistence
- State stored in **Claude Code's config system** (not files)
- Automatically recovered on plugin load
- If recovery fails, plugin gracefully disables itself

### Error Handling Strategy
- Connection errors provide user-friendly guidance (e.g., "Discord desktop app not detected")
- Graceful degradation when Discord unavailable
- State changes only persist if operation succeeds
- No error recovery blocks normal operation

### Testing Approach
- **Jest framework** for unit and integration tests
- Mock all external dependencies (discord-rpc, Claude Code API)
- Test-driven development: tests written before implementation
- Tests cover success paths, error paths, and edge cases
- Manual testing guide included for real Discord interaction

## Implementation Plan Structure

The implementation plan in `docs/superpowers/plans/2026-03-29-discord-rich-presence-plugin.md` follows a **test-driven development (TDD)** approach with 7 tasks:

1. **Project Setup** - Initialize npm package and dependencies
2. **State Management** - Implement persistence layer with tests
3. **Presence Manager** - Implement Discord connection logic with tests
4. **Command Handlers** - Implement user command interface with tests
5. **Main Plugin** - Implement lifecycle coordinator with tests
6. **Documentation** - Create README and update package.json
7. **Integration Testing** - Validate complete system and create manual test guide

Each task follows this pattern:
- Write failing test first
- Run test to verify it fails
- Implement minimal code to pass test
- Run test to verify it passes
- Add additional tests for broader coverage
- Commit the work

## Node.js and Dependencies

- **Engine:** Node.js 16.0.0 or higher
- **Production Dependencies:**
  - `discord-rpc@^4.0.1` - Discord Rich Presence client
- **Dev Dependencies:**
  - `jest@^29.7.0` - Testing framework

## Configuration and Secrets

- No API keys or secrets required
- Discord application ID is embedded in `PresenceManager`
- All configuration stored in Claude Code's config system
- `.env` file is ignored (not used by this plugin)

## Important Patterns and Conventions

### Component Initialization
All components follow a consistent pattern:
- Constructor takes dependencies (managers, APIs)
- `initialize()` or `onLoad()` method called after construction
- Lifecycle methods (`onUnload()`, cleanup) for resource management

### Error Messages
User-facing error messages should:
- Use emoji prefixes (✅ for success, ❌ for failure/disable)
- Be concise and actionable
- Suggest solutions when applicable (e.g., "Please start Discord")

### Mocking in Tests
- Mock `discord-rpc` at module level to avoid actual Discord connections
- Mock Claude Code API with minimal interface
- Use `jest.fn()` to track calls and set return values
- Mock config object with `get()` and `set()` methods

## Development Notes

### When Implementing
1. Follow the implementation plan tasks sequentially
2. Write tests BEFORE implementation code (TDD)
3. Keep components focused and single-responsibility
4. Use consistent error handling patterns
5. Ensure all tests pass before committing
6. Run full test suite: `npm test`

### When Debugging
- Check that Discord desktop app is running
- Verify Node.js version meets minimum requirement
- Review error messages for actionable guidance
- Check Discord activity settings in Discord's preferences
- Look at manual testing guide for common issues

### Code Review Checklist
- All tests pass with `npm test`
- No console errors or warnings
- Error paths gracefully handled
- State properly persists across sessions
- Discord activity appears/disappears correctly
- Plugin loads without errors on startup
- Manual testing guide test cases pass

## Relevant Documentation

- **Design Spec:** `docs/superpowers/specs/2026-03-29-discord-rich-presence-design.md` - Complete feature specification and architecture
- **Implementation Plan:** `docs/superpowers/plans/2026-03-29-discord-rich-presence-plugin.md` - Step-by-step TDD implementation guide with test code
- **User Guide:** Will be in `README.md` after implementation
- **Manual Testing:** `tests/manual-testing.md` - Real-world validation procedures
