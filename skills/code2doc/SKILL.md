---
name: code2doc
description: Create or update end-user documentation from a feature's implementation code. Use it when writing user documentation for a feature, adding configuration walkthroughs, or realigning stale pages with current behavior. Applies to any product with user-facing entry points—CLI tools, chatbots, web panels—and turns code evidence into instructions written from the user's point of view while keeping internal implementation and business-sensitive details out of the page.
metadata:
  version: "0.1.0"
---

# Code2Doc

This skill creates or updates end-user documentation from a feature's implementation code. Code answers "how does the product actually behave"; documentation answers "how do I use it"—and moving between the two takes a deliberate act of transcription. A code branch that bans a member at three warnings becomes "After a member receives 3 warnings, they are removed from the group." The behavior is unchanged; only the frame of reference moves, from code to the user's actions.

Write for a reader with no technical background, who does not read code, and who is meeting the feature for the first time. Keep that reader in mind throughout: they recognize no code identifiers, only the words on screen and what they have done.

## Confirm the project adaptation before writing

This is a general skill; it contains no product locations. Before writing, obtain the project's adaptation information—at least the five items below, plus any other established conventions the project has:

- Evidence sources: where feature implementation, UI strings, and public interface contracts live in the source repository.
- Docs repository: location, directory layout, frontmatter requirements, image storage and reference syntax, formatting tool.
- Validation commands: how formatting, builds, and tests are run.
- Screenshot channel: how to launch the UI, which automation tool captures screenshots, where captures are stored.
- Documentation language and UI language.
- Other established conventions: glossaries, style-baseline pages, contributing guides—record their locations when they exist.

Order of precedence: information the user gives in the task first; then the adaptation file `.agents/code2doc.md` at the source repository root; when neither exists, explore both repositories and restate the findings to the user for confirmation.

The adaptation file is the answers to the questions above. It keeps conventions consistent across sessions on the same project. The first time this skill runs on a project, organize the findings into that file (its content needs the user's confirmation); afterwards every session reads it directly, saving repeated exploration and preventing two sessions from reaching different conclusions. It plays the role for this skill that `AGENTS.md` plays for coding conventions: project configuration read by an agent. Write it in English unless the user requests otherwise—it addresses agents and shares a language with code comments. A minimal adaptation file looks like:

```markdown
- Sources: feature handlers live in packages/bot/src/handlers/; UI strings in locales/zh-hans/.
- Docs repo: ../docs. Markdown; frontmatter requires title and description; images go to assets/images/.
- Validation: mdformat, pytest, mkdocs build.
- Screenshots: run the panel locally (see repo instructions); capture with playwright-cli.
- Language: docs in Simplified Chinese; UI in Simplified Chinese.
```

Do not write documentation until the adaptation information is confirmed; the only work permitted in that period is establishing it. Whenever the adaptation file is created or updated, tell the user in the same reply where it is and what it records. A user who does not want to keep it can delete it, or ask the skill to add it to `.gitignore`—an unplanned file in a repository must always be the user's informed choice.

## Workflow

### 1. Scope the feature and gather evidence

State the feature in user terms first: what it is and where it is entered. If you cannot, go back to the code—do not carry a fuzzy understanding forward. For example, join verification, in user terms, is "a verify button a new member receives when joining; pass it to speak." That sentence fixes the starting point for evidence: read the code that handles new-member join events and follow it to the button and the verification logic, instead of picking an internal module by its plausible-sounding name.

Then gather three kinds of evidence, each with a purpose:

- Implementation code: the final authority on behavior, defaults, permission checks, and limit constants. Read it at the current checkout; never infer behavior from memory or commit messages.
- User-visible strings: interface text, command help, error messages. They are the direct source of wording—names in the documentation must match them.
- Public interface contracts: OpenAPI, MCP, CLI definitions. When the document mentions these interfaces, use only names and parameters that exist here.

Evidence also sets the scope of the change: handle only user-perceivable behavior changes. Ask "did anything the user sees change?"—wording, entry point, order, limits, defaults, feedback. A refactor that moves warning logic into a shared module and renames functions, while everything users see stays the same, produces no documentation change; if the same change also reworded a notice from "removed from the group" to "restricted from speaking," the passage containing that notice must be updated. Purely internal refactors—renames, extracted functions, swapped storage—produce no documentation change.

### 2. Extract user-visible behavior

Turn the evidence into a behavior inventory. Each entry is honored while writing and mapped back to evidence at delivery. The inventory covers:

- What the feature does: one sentence for someone who has never heard of it, sourced from the entry point and results of the processing logic.
- Entry point: where users find it—menu path, button location, command syntax—recorded verbatim from UI strings.
- Prerequisites: permissions, subscription tier, version, required prior configuration, sourced from condition checks in code.
- Configurable items: user-visible names, value ranges, defaults, and when changes take effect. Names come from UI strings; ranges come from validation logic and interface controls.
- Results and feedback: what the user sees after acting, sourced from the success path's output.
- Limits and quotas: rate, count, and duration limits users run into, and the notice shown when one is hit. Filter what may enter the document per [business-sensitive information](#business-sensitive-information-stays-out-by-default).
- Error paths: failures users may hit, the notices they see, and their next step.

The inventory is not an exhaustive dump. Before recording an item, weigh it: which user actions it affects, how many users, and whether it is an internal detail that must not be published. A settings page with twenty items gets only the ones a user must understand to use the feature correctly; the rest stay with each item's own description. Edge cases and intermediate states a normal user never reaches go into the delivery report, not the document—the longer the inventory, the more the result reads like code comments.

Concrete numbers must come from code constants or user-visible strings and appear as concrete values. If the code caps something at 5, write "up to 5," not "several." Vague numbers cannot be checked—and cannot be noticed when they go stale.

### 3. Compare against existing documentation

Find existing pages on the topic first: search by feature name, by words from the UI strings, and by command name. Not finding one does not mean none exists; search again with the names a user would type.

When found, read the whole page and classify each passage as "still correct / stale / missing." Judge against the behavior inventory from step 2; never keep content merely because it reads well. Documentation most often goes stale through detail drift, not wholesale: the entry point moved one menu deeper, the default changed from 7 days to 30, a subscription prerequisite appeared. A tutorial written in 2024 that says "open it under `Group management` > `Messages`"—when the setting has since moved to `Message management`—reads smoothly word by word, yet a user following it finds nothing. Checking entry point, defaults, limits, and prerequisites item by item beats trusting an overall impression.

When updating a page, verify the whole text, not just the addition. Screenshots count together with prose: when a screenshot shows an old interface that no longer matches behavior, both the image and its passage are stale.

Keep correct content in its original wording and structure; do not rewrite for rewriting's sake. Rewriting is not the goal—alignment with behavior is. Indiscriminate rewrites hide whether behavior actually changed from anyone reading the diff.

Create a new page only after confirming no existing page fits. Before creating, ask once more whether the content is a natural extension of an existing page. A new setting usually belongs on the feature's page, not on a page of its own—otherwise both readers and maintainers carry one more entry point.

### 4. Write and illustrate

Write prose by the rules in [Abstraction boundary](#abstraction-boundary) and [Writing style](#writing-style); capture images by [Screenshots](#screenshots).

Place a new page in the right section of the docs site's information architecture—judge by where similar features live. Find out how the site generates navigation (hand-written nav, derived from directories, front-end routing) and register the page where required. Link with neighboring pages: when a feature page's prerequisites mention panel administrator rights, link to the page that explains authorization instead of re-explaining it in place. Put links on the first mention itself, wrapping the words that point to the target: in "you need to set up a verification channel first," the phrase "set up a verification channel" is the link. Do not append connector sentences such as "see Set up a verification channel below." Page anchors and separate pages behave the same.

### 5. Validate and deliver

See [Validation and delivery](#validation-and-delivery) at the end.

## Abstraction boundary

The reader cannot see the code; every expression framed in code coordinates is noise to them. The rule: every noun in the document must answer "where in the product does the user see this?" If it cannot, replace it with a user-visible name or leave it out.

### Transcription method

The basic move swaps code coordinates for user coordinates one at a time. Take `if (warnCount >= 3) ban(user)`: `warnCount` becomes "the warnings a member has received"; `3` comes from a constant and is written as the literal number; `ban` becomes what the user experiences—"removed from the group." The result, "After a member receives 3 warnings, they are removed from the group," has a screen-visible counterpart for every word.

| Evidence in code | Wording in the document |
| --- | --- |
| Setting's code name `enableAutoDelete` | Use the on-screen name "Auto-delete messages"; the code name never appears. |
| `isAdmin(ctx)` permission check | Only group administrators can change this setting. |
| Error branch returns "insufficient permission" | If you see "insufficient permission," ask the group owner to adjust your role. |
| String key `warn.msg.deleted` | Never appears. Write the text the user actually sees. |

### Never put these in the document

Source paths and file names; code names of modules, functions, variables, and parameters; string keys; database fields; internal error codes and logs; implementation mechanisms such as caching, transactions, and module loading; unreleased or internal switches; deployment details inferred from code.

For example, "This feature lives in eventHandlers/warn.ts and triggers past the `MAX_WARN` constant" contains nothing a reader can act on, and it hands out maintenance coordinates. A user with a problem needs a feedback channel, not source locations.

### These may appear in the document

Names and text shown in the interface; command syntax and parameters; value ranges and defaults of user-configurable items; limits and quotas users actually run into (business-sensitive ones excepted); tool and parameter names from public interface contracts (API, MCP, CLI).

For example, "Kept for 24 hours by default; adjustable from 1 to 90 days"—the default and range come from the interface and validation logic, and the user needs them to decide whether to change the setting. These numbers are where documentation earns its value.

### Business-sensitive information stays out by default

Some information cannot be written as concrete numbers or rules even though users can feel it: rate-limit thresholds and windows, throttling and unban rules, abuse-prevention and risk-control decision conditions, internal quotas and capacity, rollout and experiment switches, internal costs. The reason is direct: once these numbers are public, evading them becomes a computable problem, and every legitimate user pays the price. Documentation owes readers a response, not an evasion map.

- Write the perceivable behavior and the response, not the threshold. Write "If you act too frequently within a short period, you may be temporarily limited; try again later," not "exceeding 5 requests per minute triggers a temporary limit."
- Only two exceptions allow concrete values: numbers already published in official documentation—copy them for consistency—and numbers the user has explicitly approved for publication.
- When unsure, never write it. List candidate numbers in the delivery report and let the user decide.

The same constraint governs screenshots: debug pages showing internal thresholds, and error screens that reveal throttling rules, never enter the frame.

### Judging boundary cases

Some things look internal but may be written: enum values in a dropdown—the interface lists them—and defaults that shape user behavior, which users need in order to decide whether to adjust. The test is whether the user can see it on screen and whether writing it helps them. "Kept for 24 hours by default" passes: the value is visible in settings and informs the user's decision.

Some things users run into but must not be written: concrete rate-limit and risk-control values (see [business-sensitive information](#business-sensitive-information-stays-out-by-default)), branches behind a feature switch that the current release cannot reach, deployment-dependent numbers, internal debug entry points. Encountering the phenomenon of being limited does not mean the reader should know the coordinates of the limit.

When in doubt, leave it out and put the question in the delivery report for a human.

### Leak review

Read the finished draft twice. On the first pass, ask of every noun "where does the user see this?" On the second, check only numbers: every written value is either visible in the interface, officially published, or confirmed by the user—delete any number that meets none of the three. Then examine every backtick and code block: it may hold only what a user can type, copy, or configure—command syntax, configuration samples, public interface parameters. Anything else is deleted or transcribed.

## Screenshots

### When to include images

Images are optional. Many Apple support articles carry none: when prose, links, and command samples say it clearly, add no image. The positions that genuinely need one, one point per image:

- The feature entry point: a switch or page buried deep enough that prose can misdirect; there one entry image beats a path description.
- A key step of a multi-step operation: what to fill into a dialog, which item to pick from a list. Where prose invites ambiguity, one image beats a paragraph.
- State differences: the interface before and after enabling, what a success notice looks like, the visible change an operation leaves behind.

Plain-text interfaces (command line, chat commands) usually get no images; command syntax and output are the document's own body. A warning command's documentation gives `/warn @user reason` and one sample output—denser than a chat screenshot, and it does not go stale when the interface is redesigned.

### Capture

Capture through a repeatable automated channel: drive the real running interface with the project's browser automation tool and screenshot it. The frame then matches the current version, the steps can be re-run, and nothing depends on the luck of manual operation.

Every image must come from an interface actually driven in this session, and the delivery report states its source (entry path or URL, and the capture steps). No post-processing composites: collages, redrawn regions, patched areas, and generative fills are all fabrication; the only permitted edit is cropping a region from a single real capture. When the interface cannot be run or capture fails, report the gap—the document ships without the image; never substitute an old frame, a generated image, or a retouched one.

Prepare the interface into the target state before capturing: UI language matching the documentation language, data that exercises the feature, window size uniform per the docs repository's convention. Prepare data for specific states rather than making do—showing a list of "2 tokens created" means creating two test tokens first, not capturing an empty list.

Never substitute design mockups, collages, or frames from an old version; after the interface changes, old images must be recaptured. When an old image lacks the new entry point or shows controls in the wrong place, readers follow it and fail—which is worse than no image at all.

### Frame standards

- Focus on the point: crop to the smallest complete region containing the target control so it is visible at a glance, without unrelated navigation, other groups, or developer tooling.
- Complete frame: loading spinners, errors, placeholder data, or debug overlays disqualify an image. A screenshot of a list still spinning tells readers nothing about whether the feature works—and makes them doubt how well the document is maintained.
- No sensitive information: real credentials, tokens, and real user data stay out of frame; debug pages showing internal thresholds stay out as well.

### File conventions

Store images per the docs repository's directory and naming conventions. Alt text describes the frame: "The Create Token dialog" is good alt text—it carries the same information for screen-reader users and when images fail to load; "screenshot 1" and "image" are not. Every image must pass the docs repository's build and image checks.

### Pre-insertion check

- Is the entry point or control visible at a glance?
- Is the frame in the target state, in the right language?
- Any loading, placeholder, error, or debug elements?
- Any data or internal numbers that should not be in frame?

## Writing style

Benchmark against Apple support documents: organize by task, answer first, talk to the reader, restrain formatting. Before writing, read the `ui-copy-restraint` skill (when available in this environment)—but borrow only its necessity judgment, which information deserves a place and what is repetition; do not borrow its brevity target. Interface copy sits next to the feature it describes and cuts every word it can; a help document is the conversation itself and should read like a staff member speaking to one person—full-sentence explanations, a little orientation, and ordinary courtesy all belong.

### Talk to the reader

Address the reader in the second person by default, following the docs repository's existing voice, consistently throughout. The same information lands differently depending on how it is said:

- "The entry to Auto-delete is under Settings > Message management."—describing an object.
- "If you want the bot to clean up messages automatically, turn on Auto-delete under Settings > Message management."—helping a person get something done.

The second sentence catches the reader's goal first, then gives the action, at the cost of a few words. Imagine each paragraph read aloud to one reader: answer what they are trying to achieve, then tell them how. On the final pass, rewrite receiver-less statements into sentences aimed at the reader; pure specification content such as parameter tables and value ranges is exempt.

The second person must live in the sentence structure, not just the salutation. Every sentence carries a subject—you or your group—and conditional clauses attach to that subject instead of dangling. "After subscribing, custom text can be added" leaves the actor unsaid; "Groups that subscribe can add custom text" folds the condition into the subject and completes the sentence. Open each section and option group with a lead-in saying what the part controls: "Choose under Verification location:" is a floating instruction; "Here you can choose where verification messages are sent:" states the purpose first, then the action. One lead-in per group is enough; not every sentence needs to open with "you can."

### Structure

Title pages with verb-object phrases: "Enable join verification," "Set up a verification channel"—not "How to…" questions, and not nominalized titles like "Join Verification module overview." Readers arrive searching for something to get done, and the verb carries that purpose; in a directory, verb-object entries read as a list of what you can do, while question entries read like an FAQ. A page covering a whole feature uses the feature's primary action; a single-task page uses that task's verb.

The opening paragraph answers in two or three sentences what the feature does and for whom, with no scene-setting, spoken directly to the reader. For example: "If your group is often troubled by ad accounts, enable join verification: new members must pass a check before they can speak." Knowing after the first paragraph whether this page is about them is the most basic courtesy a help document owes its reader.

Then arrange as needed: prerequisites, steps to enable or configure, results and verification, limits and cautions, troubleshooting or FAQ, related links. Omit sections that have nothing to say. A troubleshooting section lists only real issues that code or message strings can substantiate: state each problem in the words a user would use, answer first; when no such issue exists, omit the section entirely rather than inventing one. Section headings follow the docs repository's existing wording in the output language (Chinese 前提条件， 常见问题， not free translations of this skill's English section names); when no reference wording exists, choose idiomatic terms for the language and list all section headings in the delivery report for the user to confirm.

### Sentences and lists

Prose is the default carrier. Ordered lists are for operation steps executed in sequence; unordered lists are for items that are genuinely parallel and hard to phrase as a sentence (a prerequisites list, for instance). Everything else is written as connected paragraphs; do not shred paragraphs into lists to look organized. "The feature has modes A, B, and C" split into three bullets looks tidy, but which mode suits which situation—exactly the part that needs causal phrasing—has nowhere to live once split.

No marketing or evaluation (powerful, effortless, elegant), no explaining the obvious, no repeating what the title already said. Concise does not mean stripping sentences to their skeleton: phrases that carry the reader ("if you…", "once this step is done", "you can turn it off at any time") are navigation—keep them. What gets deleted is marketing language, repetition, and detail the reader cannot use. Parallel option-and-behavior descriptions always use an unordered list; reserve tables for true parameter comparisons—multi-row, multi-column specification grids where every column holds the same kind of attribute.

### Writing steps

One action per step, starting with a verb, UI element names marked per the docs repository's convention. State the expected feedback of each step so readers know they did it right:

1. Open the Settings page and click Message management.
1. Turn on Auto-delete. The switch turns on, and the feature takes effect immediately.

State prerequisites before the steps, addressed to the reader ("before enabling, make sure you are a group administrator"), not inside them. Expected feedback must have evidence: when neither UI strings nor code confirms a detail like the switch changing color, drop the phrase—never patch it from imagination.

### Terms and numbers

Call one thing one name throughout, using the on-screen name; when the project has a glossary, the glossary wins. If the interface says "join verification," the document never drifts into "join review" or "join approval"—two names for one feature read as two features. Write numbers as concrete values with units: defaults, limits, durations, scope of effect. "Kept for a fairly long time" becomes "kept for 24 hours by default"—a number can be checked; a vague phrase cannot. Whether a concrete value may be published follows [business-sensitive information](#business-sensitive-information-stays-out-by-default).

Mark feature names and UI elements, following the docs repository's established style: Chinese uses curly quotation marks (启用“入群验证”， 点按“创建 Token”), English capitalizes the official name (turn on Join Verification). The test is "these words appear on screen": mark references to a feature, menu, button, toggle, or page by its name; leave the same words unmarked when used as ordinary nouns or actions. Both uses can appear in one sentence—如果要创建关键词回复 (a thing you create) stays bare, 请点按“关键词回复” (the on-screen entry) is marked. Commands and text the user must type use backticks, never quotes. Use the same marker for the same kind of element throughout, and mark every occurrence, not just the first. In Chinese, always use curly quotes, with single curly quotes for a quotation inside a quotation; straight quotes appear only in code and English contexts. Leave one space between Chinese and letters or digits, following the docs repository's convention; link text participates in this rule like ordinary text—a link whose text starts or ends with letters or digits keeps the same space against adjacent Chinese, while pure-Chinese link text takes none.

## Examples

These examples show how code evidence lands as documentation. Adapt to the actual product and code; do not treat the sample wording as fixed answers.

| Scenario | Code evidence | Documentation wording |
| --- | --- | --- |
| Generic intro becomes configuration walkthrough | The old doc says only "helps you manage group messages"; the code has a switch, a 24-hour default, and effect logic. | "If you want the bot to clean up matching messages automatically, enable this feature; it keeps the most recent 24 hours by default. Find it under Settings > Message management." |
| Internal name leak | Setting's code name `msgAutoDelete`; on-screen label "Auto-delete messages." | The document says "Auto-delete messages"; the code name never appears. |
| Mechanism versus behavior | Counts are cached and survive restarts. | No mention of caching. Write the perceivable consequence: "Warning records survive a bot restart." |
| Stale detail | The old doc says "up to 1"; the constant is now 5. | Change to "up to 5" and check related screenshots and FAQ passages. |
| Business-sensitive value | The code has a throttle constant of "5 per minute." | The document says "you may be temporarily limited if you act too frequently within a short period"; the concrete number goes to the report as a pending-confirmation item. |
| Insufficient evidence | A rate-limit value comes from deployment configuration and is nowhere in code. | Not written into the document. Listed in the delivery report for confirmation. |

## Validation and delivery

After writing, in order:

1. Run the docs repository's formatting, build, and tests (including link and image checks); all must pass.
2. Reread the draft with [Leak review](#leak-review); check every image against [Pre-insertion check](#pre-insertion-check).
3. Report to the user: the list of changed files; the mapping from key behavior statements to evidence; items that could not be confirmed from code and need a human; the code revision the writing was based on.

The evidence mapping in the report corresponds entry by entry to the behavior inventory, for example:

- "Up to 5"—from the limit constant, visible in the interface.
- "Only administrators can change it"—from the permission check in the handler.
- "Concrete throttle value"—business-sensitive, not written; never published officially, your call whether to publish.

Never write content that evidence cannot support; put uncertain behavior into the report for confirmation instead of stating it as fact. Follow the docs repository's existing convention for update dates or version marks; when the repository has no such mechanism, invent none—propose one to the user when needed.

## Pre-delivery checklist

- Every noun in the document—where does the user see it?
- Every written number—visible in the interface, officially published, or confirmed by the user?
- From the first paragraph alone, can a reader tell whether this feature concerns them?
- Does every passage sound like it is spoken to one reader? Are there long stretches of pure third-person description with no "you"?
- Does every conditional clause carry a subject? Does each section and option group open with a lead-in?
- Does every step carry expected feedback, and does every feedback statement have evidence?
- Do the screenshots match the current interface?
- Was the updated page verified in full, or were only the additions touched?
- Is there a sentence that could be deleted without costing the reader any action or judgment?
