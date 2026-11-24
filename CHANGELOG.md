# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-11-24

### Added
- First release as its own repository. Until now vin-meter shipped inside the `vin-core` plugin of
  [VinSkills](https://github.com/VinVirtual/vinskills); it is still installable from there.
- `SKILL.md` at the repository root, so the repository installs directly as a skill or as a plugin.
- README, MIT licence, `check_env.sh`, test suite (`npm test`) and CI with skill-ci.

### Changed
- Renamed from the earlier in-marketplace name to `vin-meter`: the skill, its folder and the CLI (`scripts/vin-meter.mjs`).
