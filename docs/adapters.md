# Agent Adapters & Discovery

`auteur-ui` is designed to be installed seamlessly across every major AI coding agent with a single command. It automatically detects the agent environment in your repository and writes the optimal instruction and slash-command format.

---

## Supported Agent Adapters

| Agent | Detection Path | Skill Target | Slash Command Target |
| :--- | :--- | :--- | :--- |
| **Claude Code** | `.claude/` | `.claude/skills/auteur-ui/SKILL.md` | `.claude/commands/auteur-ui.md` |
| **OpenCode** | `.opencode/` | `.opencode/skills/auteur-ui/SKILL.md` | `.opencode/commands/auteur-ui.md` |
| **Cursor** | `.cursor/` | `.cursor/rules/auteur-ui.mdc` | Embedded rule with frontmatter |
| **Codex** | `.codex/` | Managed block in `./AGENTS.md` | Delimited instruction block |
| **Antigravity** | `.gemini/` | Managed block in `./AGENTS.md` | Universal instruction block |
| **Universal / Fallback**| None | Managed block in `./AGENTS.md` | `<!-- auteur-ui:start -->` block |

---

## Installation Mechanics

To install into any repository:

```bash
npx auteur-ui init
```

### Auto-Detection & Explicit Overrides
By default, `auteur-ui init` inspects your repository for existing agent directories. If you want to force installation for a specific agent, pass the `--agent` flag:

```bash
npx auteur-ui init --agent claude
npx auteur-ui init --agent cursor
npx auteur-ui init --agent opencode
npx auteur-ui init --agent generic
```

---

## Managed File Manifest

When installed, `auteur-ui` tracks every created file in `.auteur-ui/install-manifest.json`:
- **Skill Definition**: Under 500 tokens (e.g. `.claude/skills/auteur-ui/SKILL.md`).
- **Slash Command**: Under 120 tokens (e.g. `.claude/commands/auteur-ui.md`).
- **Vendored Assets**: Offline assets copied into `.auteur-ui/assets/`:
  - `css/` (reset, type, rhythm, focus, elevation, motion, tailwind-theme)
  - `motion/` (WAAPI primitives, React hooks, physics tokens)
  - `sound/` (Web Audio synthesizer kits)
  - `type/` (Fluid scales, font-face stacks)
- **Lockfile & Version**: `.auteur-ui/lockfile.json` and `.auteur-ui/version`.

### Git Exclusion & Vendoring
By default, `.auteur-ui/assets/` is added to `.gitignore` to keep user git history clean. If you are deploying to an isolated CI environment or wish to check assets directly into git, pass the `--vendor` flag:

```bash
npx auteur-ui init --vendor
```

---

## Verification & Diagnostics

To verify that the skill is correctly registered and ready for execution:

```bash
npx auteur-ui doctor
```

Output:
```
======================================================
         auteur-ui System Doctor Checklist
======================================================

 [✓] Skill Discoverability   : Discovered Claude Code skill at .claude/skills/auteur-ui/SKILL.md
 [✓] Router Token Budget     : 463 tokens (limit: <= 500 tokens)
 [✓] Assets Present          : Assets verified in .auteur-ui/assets/ (4/4 categories)
 [✓] Playwright Engine       : Playwright installed for headless rendering
 [✓] Node.js Version         : v22.0.0 (>= 18.0.0 required)
 [✓] Contract Validity       : .auteur-ui/contract.json (ready for lock)
 [✓] Trace Health            : .auteur-ui/trace.jsonl (valid)

------------------------------------------------------
Status: All diagnostic checks passed (7/7).
```

---

## Updating & Safe Uninstallation

### Updating
To synchronize newer asset versions or repair broken skill references:
```bash
npx auteur-ui update
```

### Clean Uninstallation
To completely remove all managed skill files, slash commands, manifests, and assets without touching your application code or git history:
```bash
npx auteur-ui uninstall
```
