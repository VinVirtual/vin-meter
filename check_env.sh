#!/usr/bin/env bash
# What vin-meter needs, and how to fix anything missing.
set -u
ok=1
say() { printf '%-5s %s\n' "$1" "$2"; }
if command -v node >/dev/null 2>&1 && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 22 ]; then say ok "node $(node -v)"; else say FAIL "Node.js 22+ is needed: https://nodejs.org"; ok=0; fi
[ -d "$HOME/.claude/projects" ] && say ok "transcripts folder found" || say warn "no ~/.claude/projects yet: use Claude Code once, or pass --dir <folder with *.jsonl>"
[ "$ok" = 1 ] && echo "vin-meter is ready." || { echo "Fix the FAIL lines above."; exit 1; }
