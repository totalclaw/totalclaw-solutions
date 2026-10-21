# Codex Entry — OSINT Agent

This repository is an OSINT Agent project originally structured for the agent. Codex must preserve the existing `.the agent/` configuration and use it as the source of truth instead of replacing it.

## Required Startup Order

1. Read `the agent.md` completely first.
2. Read `.the agent/commands/osint.md` before running any `/osint` workflow.
3. Select and read the matching file under `skills/` for the requested investigation type.
4. Use `docs/` and `templates/` as supporting references when they exist.
5. Keep `.the agent/commands/osint.md` and `.the agent/mcp.json` intact unless the user explicitly asks to change the agent behavior.

## OSINT Command

Primary command shape:

```text
/osint [target] [type]
```

Supported types include:

```text
company | person | supplier | competitor | amazon-seller | seller-scout | quick-id | b2b-gtm | industry | persona | psychograph | research
```

If the user does not provide a type, infer it using the rules in `.the agent/commands/osint.md`; default to `company` when uncertain.

## Codex Behavior

When a user asks for company research, competitor intelligence, supplier checks, Amazon seller investigation, market/industry analysis, buyer persona work, or general commercial OSINT:

1. Treat the request as an OSINT Agent task.
2. Follow the full workflow from `.the agent/commands/osint.md`: PIR definition, data collection, source grading, ACH analysis, weakness-crossing analysis, and report generation.
3. Use public and compliant sources only.
4. Preserve source URLs and label confidence for important claims.
5. Save generated reports according to the repository rules in `the agent.md`.
6. Never expose or request API keys, tokens, cookies, or private credentials in chat.

## Secret Safety

Real secrets must stay only in the user's local `.env` file or local environment variables. Do not commit secrets to this repository and do not paste them into the conversation.

Expected local variables are documented in `.env.example`. If a variable is missing, list only the variable name and purpose; never print a complete existing value.

## Codex Skill

This repository includes a Codex skill adapter under `codex-skill/osint/`. Install it from the repository root with:

```bash
bash codex-skill/install.sh
```

The installer updates `OSINT_AGENT_HOME` inside the skill to the current local clone path and links or copies the skill into `~/.codex/skills/osint`. It also generates `codex-skill/config.toml.snippet` for MCP configuration review.

Before merging any MCP snippet into `~/.codex/config.toml`, check that existing `[mcp_servers.*]` sections are not duplicated and never overwrite unrelated Codex settings.
