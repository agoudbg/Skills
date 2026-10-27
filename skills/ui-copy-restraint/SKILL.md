---
name: ui-copy-restraint
description: Decide which copy is needed and how to express it clearly when building an application interface from scratch, editing one, or reviewing it. Avoid development commentary, redundant descriptions, and excessive explanation when generating copy, and simplify them in existing interfaces. Applies to pages, forms, settings, dialogs, feedback, and empty states.
metadata:
  version: "0.1.1"
---

# Concise UI Copy

Control the amount of interface text while ensuring that users understand actions and their consequences, whether building a new interface or editing an existing one.

Do not add descriptions by default to new interfaces. When editing an interface, retain necessary copy and simplify or remove unnecessary text.

Consider the intended audience, current task, surrounding interface, and confirmed product behavior. Follow the product's established language, terminology, and voice.

## Decide whether text is needed

Before adding or retaining text, identify the user's task or decision at that point. What specifically would they misunderstand, do incorrectly, or be unable to do without it? Account for what the labels, controls, content, and existing feedback already convey.

Apply this necessity test to every rule below, including guidance about technical details, status, costs, limits, and scope. A fact being accurate, new, or in one of these categories does not by itself justify displaying it. Product details in the requirements guide correct implementation; they do not each need an explanation in the interface. Honor explicit requests for explanations at the requested place and time.

If there is no clear loss, omit the text from a new interface or remove it from an existing one. Do not fill description, subtitle, helper text, or tooltip slots just because they exist. Empty space is not a reason to add copy.

For example, a "Refresh" button does not need adjacent text or a tooltip saying "Click Refresh to get the latest content."

Useful copy serves a concrete purpose:

### Help users identify content, location, or an action

- When collecting both shipping and billing addresses, label them "Shipping address" and "Billing address" to prevent mix-ups.
- When an export action produces only CSV files, label its button "Export CSV" so users know what file they will get.

### Explain conditions or consequences that the label and interface do not reveal

- If a setting requires a restart, add "Takes effect after restarting" below it.
- If a setting affects only projects created afterward, add "Applies only to new projects" so users do not expect existing projects to change.

### Communicate actual status, outcomes, or recovery actions

- If an import succeeds only partly, show "92 imported, 8 failed" and provide "View failed records." Saying only "Import complete" hides the failures.
- If a user has view-only access to a document, show "View only." If the product supports access requests, provide a "Request edit access" action so the user can continue.

## Keep development commentary out of the interface

Do not put implementation progress, design revision notes, acceptance notes, responses to prompts, or justifications for design choices in user-facing interfaces.

For example, "Loading states have been added as requested" and "This layout uses consistent spacing" describe development work. Omit them from generated pages and remove them from existing interfaces. Report these changes in the conversation with the user when needed.

Include technical details when users need them to enter a value, choose an option, inspect a result, or resolve a problem. A developer audience does not make every implementation detail useful. File paths, configuration names, and protocol parameters may be necessary; explanations of how the application works still need a purpose at that point.

Distinguish development progress from the actual outcome of a user's action. Preserve feedback needed to understand whether an operation is pending, succeeded, or failed, without appending unrelated implementation or storage details.

## Avoid repetition across the interface

Evaluate text in context rather than polishing each sentence in isolation.

### Omit subtitles that repeat an obvious purpose

For example, a "Download history" page listing download tasks does not need "View and manage your downloads here."

For unfamiliar or easily misunderstood features, use a short explanation to help users understand and remember their purpose. Add information the heading does not convey.

For example, a notes app has a feature named "Time travel" that randomly selects three old notes each day. "Rediscover 3 random notes each day" explains what the name means.

### Omit descriptions that repeat labels

A "Copy link" button does not need "Click the button to copy the link to your clipboard" beside it.

A "Start date" field does not need "Please select a start date here."

### Do not restate visible content or actions

If a page already has "Images," "Videos," and "Audio" categories, omit "Browse by images, videos, and audio."

If a file table already has "Name," "Size," and "Modified" columns, omit "The table below shows the name, size, and modification time of each file."

### Show information where and when it matters

Once information is needed, choose its location and duration. Explain input requirements beside the field, consequences before the relevant action, and failures where users can recover. Details that matter only for a particular choice or state should appear when it applies. Keep text visible throughout a task only when it remains useful throughout that task.

For example, show a pagination range when users navigate a partial list. A short list already showing every item and its total does not also need a range summary. The information is valid in both states, but useful in only one.

If a file picker already says "PNG and JPG supported," do not repeat it at the bottom of the page. An error after selecting an unsupported file may repeat the format requirement.

Do not move redundant copy wholesale into tooltips, disclosures, or help links. Use on-demand explanations for useful optional detail. Keep information needed to avoid a mistake visible before the user commits the action.

## State the behavior users care about

Use specific actions, objects, states, and outcomes. Avoid vague value claims, feature self-introductions, and modifiers that add no information.

A toggle label should clearly describe the enabled behavior. Supporting copy should explain non-obvious conditions, limitations, or consequences. Do not routinely describe both the enabled and disabled states.

Make the label accurate before deciding what else to explain. Put the object, scope, or trigger in the label when it fits naturally. Do not use a broad label and then a paragraph to narrow its meaning. Once the label defines the scope, there is no need to list every excluded case.

Add supporting text when the label cannot convey the complete meaning. Do not create ambiguity to save words or replace ordinary language with abbreviations. Still state consequences that users could misunderstand.

- If a toggle enables notifications after downloads finish, use "Notify me when downloads finish." There is no need to explain that disabling it stops those notifications.
- If notifications are sent only when someone mentions the user in a comment, label the toggle "Notify me when I'm mentioned in a comment." There is no need for "Comment notifications" followed by "When enabled, the app sends a notification when someone mentions you in a comment. Comments that do not mention you will not trigger a notification." The label states the trigger, so the paragraph is unnecessary.

## Preserve necessary information

Retain facts that affect the decision or action at hand, such as costs, deletion scope, access permissions, irreversible consequences, and non-obvious conditions for a change to take effect. These categories do not require standing notices elsewhere in the interface.

State the consequence and any choice the user needs to make. Include the underlying mechanism only when it changes how they should act; a warning does not need to explain the whole failure process.

Preserve necessary labels, input requirements, recovery guidance, and accessible names. Do not move essential information exclusively into placeholders or hover content to reduce visible text.

Copy must reflect confirmed product behavior. Do not invent promises about saving, synchronization scope, recoverability, or other unconfirmed behavior.

- If deleting an account also deletes cloud files and cannot be undone, state both consequences in the confirmation. "Delete account?" alone is insufficient.
- If save feedback is needed, "Saved" may be sufficient. Explain storage scope when users need it to judge availability elsewhere. Never imply synchronization unless it is confirmed.

When educational content, onboarding, or brand expression is an explicit requirement, judge it by that purpose rather than applying the omission habits of a utility interface.

## Write necessary content concisely

Once content is needed, express it briefly and completely. Apply these techniques when generating copy or rewriting existing text:

- Use verbs for actions: replace "Perform a file download operation" with "Download file."
- Omit subjects already clear from context: in upload status text, replace "The system is uploading files" with "Uploading files."
- Avoid explaining the same meaning twice: replace "The link expires in 7 days and can no longer be used after it expires" with "Link expires in 7 days."
- When a limit needs explaining, preserve its quantity and scope: replace "You can select and upload a maximum of 10 files at a time" with "Upload up to 10 files at a time." This does not require repeating a limit the interface already makes clear.

Do not impose a fixed word count on all copy. When conditions or consequences matter, prioritize complete meaning that users can understand on the first read.

## Examples

These examples show which copy can be omitted, which needs simplifying, and which must appear. When building from scratch, write the necessary content directly. When editing an interface, remove or rewrite unnecessary text. Apply the reasoning to the actual interface and confirmed behavior. Do not treat the sample wording as a fixed answer.

| Scenario | Copy to review | Expected treatment |
| --- | --- | --- |
| Development commentary enters the product | A page corner says, "This iteration completes the navigation structure improvements, with key actions now standardized to a high-contrast visual specification." | Remove the entire passage. It describes development work. |
| An obvious page receives a generic introduction | Below the "Members" heading: "View and manage your team members in one place, with flexible control over each member's role and access permissions." A member list and role selectors are already visible below. | Remove this repeated explanation. If a role has permission restrictions that are not apparent, explain them at the role selector. |
| Both toggle states are mechanically explained | "When enabled, the system automatically sends meeting notes to participants after each meeting. When disabled, automatic sending stops, and you can still send notes manually as needed." | If this behavior is confirmed, use "Send notes to participants after meetings" as the label. Omit supporting copy if the manual sending action is already clearly visible. |
| Shortening would mislead | A download cleanup confirmation says, "Downloaded files will be deleted from this device. Files in the cloud will be kept." | Preserve the deletion scope and the fact that cloud files remain. Wording may change, but do not reduce it to "Confirm cleanup?" |
| Technical information is part of the task | A developer tool says, "Connection failed: the certificate has expired." | Preserve the specific cause. Do not replace it with "Unable to connect right now" merely because the information is technical. |
| Accurate technical information adds no useful guidance | Below an "Export images" button: "Images are encoded in a background worker before the archive is assembled." | Omit the explanation. It does not help users choose or complete the export, even in a developer tool. |
| A cost matters at a particular action | A dashboard always says "Publishing to the catalog costs 2 credits per item." The user is browsing unpublished items. | Show the cost when the user selects items to publish, before confirmation. For three selected items, "Publish 3 items for 6 credits?" states the action and total cost. A permanent dashboard notice is unnecessary. |
| The existing copy is appropriate | A search field is labeled "Search projects" with no additional description. | Leave it unchanged. Do not add copy just to demonstrate an improvement. |

## Review the complete interface

Review the pages and states as users encounter them:

- Which text matters only to developers or reviewers?
- What misunderstanding or blocked action does each explanation prevent at this point?
- Which facts are repeated across labels, controls, content, and feedback?
- Which notices belong only to a particular choice, action, or state?
- Are short badges, summaries, and footer notes adding clutter without helping the current task?
- Do labels state the action and its scope directly, without omitting necessary conditions?
- Can users spot the main actions and important limitations without reading every description?
- Has removing copy left empty description containers or awkward spacing?

When building an interface, omit unnecessary description rows and status areas entirely. When editing one, preserve functionality and behavior while making the local structural changes needed for the copy edits. Shortening every sentence is insufficient if the interface still contains unnecessary text areas.

Use these checks internally. Do not display the review process, these rules, or explanations of copy improvements inside the product.
