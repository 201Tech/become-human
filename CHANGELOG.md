# Changelog

All notable changes to BecomeHuman. Format based on [Keep a Changelog](https://keepachangelog.com),
versions follow [Semantic Versioning](https://semver.org).

## [0.6.1] - 2026-11-11

### Added
- Claude Code plugin and marketplace: `/plugin marketplace add DanielDDHM/become-human`.
- Listing in the official MCP Registry as `io.github.DanielDDHM/become-human`.
- Plugin icon.
- `npm version` keeps every version field in sync (package, registry, plugin).

### Changed
- The plugin starts an exact npm version, as the Claude directory requires.
- The npm package no longer ships the icon source.

## [0.6.0] - 2026-11-11

First release on npm: `npx -y become-human`.

### Changed
- Repository renamed to `become-human`, matching the npm package.
- Build cleans old files before compiling.

## [0.5.0] - 2026-11-11

### Added
- **The human leads:** the human is the absolute authority and their decision is final.
- **Make their life easier:** the agent looks for ways to lighten the work, acting only with consent.
- Profile limit (`BECOME_HUMAN_PROFILE_LIMIT`, default 50) and no duplicated facts.

### Changed
- Rules work for any kind of work, with code as one case.
- Session start uses about half the tokens: compact rules, one line per profile topic,
  only open items of the current project.
- `forget` takes words from the fact instead of a number.

### Fixed
- Saving no longer erases notes the human wrote by hand in the profile or the maps.

## [0.4.0] - 2026-11-11

### Added
- Visible data folder `~/BecomeHuman`, configurable with `BECOME_HUMAN_HOME`.
- Personal rules in `my-rules.md`, added to every session.
- Files in the human's language with `BECOME_HUMAN_LANG` (`en`, `pt`).
- `where_is_my_data` tool.
- Code owners, protected `main` and `develop`, contribution guide.

### Changed
- Profile grouped by topic; idea maps as a single Markdown checklist per project.
- README for people who use it; technical details moved to CONTRIBUTING.

## [0.3.0] - 2026-11-11

### Added
- The current project's map is loaded on connect, so the agent opens with "where we left off".

## [0.2.0] - 2026-11-11

### Added
- Operator profile: `remember`, `forget`, `get_profile`.
- Idea maps per project: `get_map`, `map_add`, `map_resolve`.
- Partner rules: continuity, tone and pace, partnership, growth.
- Terminal banner with the two hands.

## [0.1.0] - 2026-11-11

### Added
- MCP server with human-first rules sent as instructions and the `get_rules` tool.

[0.6.1]: https://github.com/DanielDDHM/become-human/compare/d862cfd...v0.6.1
[0.6.0]: https://www.npmjs.com/package/become-human/v/0.6.0
