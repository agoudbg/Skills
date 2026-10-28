# Skills

Personal skills maintained by agoudbg.

Skills are written in English. Generated content follows the language requested by the user.

## Skills

| Skill | Purpose |
| --- | --- |
| [Concise UI Copy](skills/ui-copy-restraint/SKILL.md) | Write necessary interface copy clearly when building or editing an interface. Avoid development commentary, redundant descriptions, and excessive explanation. |

## Installation and updates

Use [Vercel's skills CLI](https://github.com/vercel-labs/skills) to install skills and manage updates. Install Concise UI Copy for use across projects:

```sh
npx skills add agoudbg/Skills --skill ui-copy-restraint -g
```

Choose your coding agents when prompted. Omit `-g` to install into the current project instead. Access to a private repository requires permission and configured Git or GitHub CLI authentication.

Check for updates, then update this skill:

```sh
npx skills check
npx skills update ui-copy-restraint -g
```

The update command above targets the global installation; use `-p` for a project installation. See the [CLI reference](https://github.com/vercel-labs/skills/blob/main/docs/commands.md) for other options.

For GitHub installations, the CLI records the source and compares the skill directory's content hash to detect updates. Detection does not depend on `metadata.version` or GitHub Releases. Run `skills check` to discover updates; changing a version number does not send notifications. Manually copied files are not automatically tracked by the CLI.

## Testing a skill before release

[`skill-canary`](skill-canary/) injects a copy of a skill directory into `~/.agents/skills` under a canary name (`<name>-canary`), rewrites the frontmatter `name` and `description` so agents list it as a distinct test build, and records a `.skill-canary.json` manifest for cleanup. This exercises the real skill loader—discovery, catalog listing, and triggering—before the skill is published:

```sh
npx skill-canary inject ./skills/<name>
npx skill-canary list
npx skill-canary refresh <name>-canary
npx skill-canary clean <name>-canary
```

The source lives in [`skill-canary/`](skill-canary/) and is published to npm as [`skill-canary`](https://www.npmjs.com/package/skill-canary). Injected directories are plain folders, so the Vercel skills CLI does not track them and `skills check` stays clean.

## Versioning

Each skill has its own version in the `SKILL.md` frontmatter, following the optional [Agent Skills metadata field](https://agentskills.io/specification#metadata-field):

```yaml
metadata:
  version: "0.1.0"
```

Use `MAJOR.MINOR.PATCH` as a lightweight maintenance convention:

| Change | Version update |
| --- | --- |
| Wording, example, or small rule corrections | Increment PATCH, such as `0.1.0` to `0.1.1`. |
| New use cases or substantial changes to guidance | Increment MINOR, such as `0.1.1` to `0.2.0`. |
| Incompatible changes to purpose, invocation, or expected output | Increment MAJOR and explain the migration impact. |
| Changes outside a skill's published content | No version change. |

The version in each skill's frontmatter identifies its published revision. See Git history for change details. Version numbers describe the intended scope of a change; they do not guarantee identical model behavior.

This repository does not use repository-wide GitHub Releases.
