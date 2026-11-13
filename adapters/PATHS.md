# Agent Candidate Paths & Adapter Specification

Verified: **2026-11-13**

This document records the verified candidate binary names, project configuration directories,
global configuration directories, and target installation paths for each supported AI coding
agent. In accordance with the `auteur-ui` design invariants, installers probe candidate lists
in priority order and report the exact matched path rather than assuming a single static location.

---

## 1. Claude Code (`claude`)

### Binaries Checked
- `claude` (in user `$PATH`)
- `/usr/local/bin/claude`
- `~/.npm-global/bin/claude`

### Configuration Directories Checked
- **Project Candidates**:
  - `./.claude`
  - `./.claude.json`
- **Global Candidates**:
  - `~/.claude`
  - `~/.config/claude`
  - `~/.claude.json`

### Target Installation Paths
- **Project Scope (Default)**:
  - Skill Router: `.claude/skills/auteur-ui/SKILL.md`
  - Command: `.claude/commands/auteur-ui.md`
- **Global Scope (`--global`)**:
  - Skill Router: `~/.claude/skills/auteur-ui/SKILL.md`
  - Command: `~/.claude/commands/auteur-ui.md`

### Reference Documentation
- Anthropic Claude Code Documentation: Tool & Skill Discovery
- Skill structure: `.claude/skills/<name>/SKILL.md` with YAML frontmatter
- Slash commands: `.claude/commands/<command-name>.md`

---

## 2. opencode (`opencode`)

### Binaries Checked
- `opencode` (in user `$PATH`)
- `/usr/local/bin/opencode`
- `~/.local/bin/opencode`

### Configuration Directories Checked
- **Project Candidates**:
  - `./.opencode`
  - `./opencode.json`
  - `./.agents`
- **Global Candidates**:
  - `~/.config/opencode`
  - `~/.opencode`

### Target Installation Paths
- **Project Scope (Default)**:
  - Skill Router: `.opencode/skills/auteur-ui/SKILL.md`
  - Command: `.opencode/commands/auteur-ui.md`
  - Config Snippet: `./opencode.json` (or `.opencode/opencode.json` if `.opencode` is present)
- **Global Scope (`--global`)**:
  - Skill Router: `~/.config/opencode/skills/auteur-ui/SKILL.md`
  - Command: `~/.config/opencode/commands/auteur-ui.md`
  - Config Snippet: `~/.config/opencode/opencode.json`

### Configuration Snippet Schema
```json
{
  "$schema": "https://opencode.ai/config.json",
  "commands": {
    "auteur-ui": {
      "description": "Run auteur-ui to build distinctive, non-generic UI designs",
      "template": "Execute the auteur-ui skill workflow: inspect .auteur-ui/contract.json or run npx auteur-ui brief, preview directions, lock look, and lint output."
    }
  },
  "permission": {
    "skill": {
      "auteur-ui": "allow"
    }
  }
}
```

### Reference Documentation
- OpenCode Documentation: Skills, Commands, and `opencode.json` Configuration Specification (Checked 2026-11-13).

---

## 3. Cursor (`cursor`)

### Binaries Checked
- `cursor` (in user `$PATH`)
- `/Applications/Cursor.app/Contents/MacOS/Cursor` (macOS)
- `~/.local/bin/cursor`

### Configuration Directories Checked
- **Project Candidates**:
  - `./.cursor`
  - `./.cursorrules` (legacy fallback)
- **Global Candidates**:
  - `~/.cursor`
  - `~/.config/Cursor`

### Target Installation Paths
- **Project Scope (Default)**:
  - Rule Router: `.cursor/rules/auteur-ui.mdc`
- **Rule MDC Frontmatter Specification**:
```markdown
---
description: Designs and redesigns any app, dashboard, landing page, or UI to make it look authentic and avoid generic styling
globs: ""
alwaysApply: false
---
```
*(Token-condensed router respecting the <= 500 token budget invariant).*

### Reference Documentation
- Cursor Official Documentation: Project Rules & `.mdc` Schema Specification (Checked 2026-11-13).

---

## 4. Codex (`codex`)

### Binaries Checked
- `codex` (in user `$PATH`)
- `/usr/local/bin/codex`
- `~/.codex/bin/codex`

### Configuration Directories Checked
- **Project Candidates**:
  - `./.codex`
  - `./AGENTS.md`
- **Global Candidates**:
  - `~/.codex`

### Target Installation Paths
- **Project Scope (Default)**:
  - Managed block in `./AGENTS.md`:
```markdown
<!-- auteur-ui:start -->
...
<!-- auteur-ui:end -->
```

### Reference Documentation
- OpenAI Codex CLI and Agent Specification Guidelines (Checked 2026-11-13).

---

## 5. Antigravity (`antigravity` / `agy`)

### Binaries Checked
- `antigravity` (in user `$PATH`)
- `agy` (in user `$PATH`)
- `/usr/local/bin/agy`

### Configuration Directories Checked
- **Project Candidates**:
  - `./.gemini`
  - `./AGENTS.md`
- **Global Candidates**:
  - `~/.gemini/antigravity`
  - `~/.gemini`

### Target Installation Paths
- **Project Scope (Default)**:
  - Managed block in `./AGENTS.md` enclosed by fences:
```markdown
<!-- auteur-ui:start -->
...
<!-- auteur-ui:end -->
```

### Reference Documentation
- Google DeepMind Antigravity CLI & Skill Architecture (Checked 2026-11-13).

---

## 6. Generic / Fallback

When no specific agent binary or config folder is detected, or when generic installation is requested:
- Target: Managed block in `./AGENTS.md` enclosed by `<!-- auteur-ui:start -->` and `<!-- auteur-ui:end -->`.
- Enables universal discovery across any agent adhering to the `AGENTS.md` standard.
