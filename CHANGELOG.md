# Changelog

## 2.4.0

### Minor Changes

- 0913c44: Add a GitHub navigation link to the demo layout.
- 6d09947: Add a theme toggle feature to the demo application, allowing users to switch between light and dark themes.
- 17e3879: Add a useEffect hook to update the document title based on the current route in the application.
- 27603b2: Replace SVG icons with Radix UI icons for theme toggle and GitHub link.
- 1e37318: Add support for dark mode by toggling the 'dark' class on the document element based on the theme.
- 4c1e6e6: Add a new hook useHistoryState for managing state with undo/redo support.

### Patch Changes

- 313b12a: Update demo components to improve layout and styling for better responsiveness.
- a72c804: Update styles for demo components to improve layout and spacing.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.3.0] - 2026-07-24

### Added

- add cross-tab synchronization to useLocalStorage via the storage event
- add useClickOutside hook
- add ClickOutsideDemo component
- add one file per hook pattern for better organization
- add demo file naming convention for consistency

### Changed

- rename hook directories to kebab-case (e.g. useScrollToElements -> use-scroll-to-elements); hook export names remain camelCase
- update README to reflect 13 hooks
- change demo imports to match new file naming convention

### Fixed

- fix a race condition in useImage where a stale image load or pending retry timer could overwrite state after src changed or the component unmounted
- fix useScrollToElements to release refs to unmounted elements instead of holding stale DOM nodes
- fix useBodyScrollLock to ref-count nested locks (e.g. stacked modals) so styles restore correctly regardless of unmount order, and compensate for scrollbar width to avoid layout shift
- fix useTimeline to cancel a pending requestAnimationFrame on cleanup, preventing a stale callback from mutating the DOM after an effect was cleaned up
- fix useLocalStorage to use the current initialValue instead of a stale one captured at first mount when seeding a newly-changed key

## [2.2.0] - 2026-03-22

### Added

- Add useTimeline hook and export it from hooks index.

## [2.1.0] - 2026-02-08

### Added

- Add useThrottle hook.

### Changed

- Switch package output to ESM-only.
- Refresh documentation to match current hooks and build outputs.

## [2.0.2] - 2026-01-24

### Changed

- Improve element reference handling in useResponsiveSize.

## [2.0.1] - 2026-01-18

### Changed

- Update hooks count and add useDebounce description in README.

## [2.0.0] - 2026-01-18

### Changed

- Simplify autoInvoke logic in useDebounce.

## [1.1.3] - 2026-01-17

### Fixed

- Align function name with folder name (useResponsiveSize).

## [1.1.2] - 2026-01-17

### Changed

- Update bilingual README and add language selector.

## [1.1.1] - 2026-01-17

### Changed

- Migrate from npm to pnpm with lock file generation.
- Add GitHub Actions workflows (CI, publish, release, docs deploy).
- Establish commit message conventions (Korean/English).
- Update prettier and development dependencies.
- Improve package.json with English description.

## [1.1.0] - 2026-01-08

### Added

- Add delay and container options to useElementSize hook.

[Unreleased]: https://github.com/pjb0811/use-hooks/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/pjb0811/use-hooks/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/pjb0811/use-hooks/compare/v2.0.2...v2.1.0
[2.0.2]: https://github.com/pjb0811/use-hooks/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/pjb0811/use-hooks/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/pjb0811/use-hooks/compare/v1.1.3...v2.0.0
[1.1.3]: https://github.com/pjb0811/use-hooks/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/pjb0811/use-hooks/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/pjb0811/use-hooks/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/pjb0811/use-hooks/releases/tag/v1.1.0
