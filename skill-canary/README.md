# skill-canary

Test an Agent Skill in place before publishing it.

`skill-canary` injects a copy of a skill directory into your skills directory under a canary name (`<name>-canary`). The copy's frontmatter `name` and `description` are rewritten so your agent lists it as a distinct test build, and a `.skill-canary.json` manifest records where the copy came from. You test discovery and triggering against the real skill loader, then remove the injection without touching released skills.

## Why

- **Test the whole path, not just the text.** A canary appears in the agent's skill catalog exactly like a released skill would, so auto-loading and name resolution are exercised too.
- **Reversible.** `clean` deletes only directories that carry a skill-canary manifest, and refuses to delete a canary you modified unless you pass `--force`.
- **No interference with skill managers.** Injected directories are plain folders; the [Vercel skills CLI](https://github.com/vercel-labs/skills) does not track them, so `skills check` stays clean.

## Usage

```sh
npx skill-canary inject /path/to/repo/skills/my-skill
npx skill-canary list
npx skill-canary refresh my-skill-canary
npx skill-canary clean my-skill-canary
```

### inject

Copies the skill directory to `<skillsDir>/<name>-<suffix>`, keeps the frontmatter name identical to the directory name, and appends a short marker to the description (default `(TEST BUILD)`). The marker is deliberately short: it identifies the build in the catalog while minimally perturbing auto-trigger behavior.

If a production skill with the same base name is installed in the same directory, `inject` warns you — the agent may auto-load the production skill instead of the canary, so invoke the canary by its full name in test prompts.

### refresh

Re-copies the canary from its recorded source and re-applies the marker. Use it while iterating on the source skill. If the canary copy itself was modified after injection, `refresh` refuses unless you pass `--force`.

### clean

Deletes a canary injection. Selection happens by canary name or original name; with multiple injections present, specify which one. Only directories carrying a `.skill-canary.json` manifest are ever selected, and a directory-name mismatch is refused.

## Options

| Option | Description | Default |
| --- | --- | --- |
| `--dir <skillsDir>` | Skills directory to operate on. | `~/.agents/skills` |
| `--suffix <name>` | Canary suffix; the injection is `<name>-<suffix>`. | `canary` |
| `--note <text>` | Marker appended to the description. | `TEST BUILD` |
| `--name <name>` | Select a canary by name (alternative to the positional argument). | — |
| `--force` | Overwrite a canary that was modified after injection. | — |

## Requirements

Node.js 18 or newer. No runtime dependencies.

## License

[MIT](LICENSE)
