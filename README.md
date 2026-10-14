# Marvel Rewatch

Ayush’s Marvel rewatch dashboard: a watchlist, Bluesky review journal, and viewing-time planner.

- **Live site:** https://ayush-marvel-rewatch.yellow-field-6391.chatgpt.site
- **Source repository:** https://github.com/AyushMahajan06/marvel-rewatch (private)

## Sources of truth

The Google Sheet’s **Manual** tab defines the list and order. Bluesky posts supply completed rewatch entries and explicit ratings. The app reads both through `/api/rewatch`; it never edits the sheet or publishes posts. A missing review is not proof that a title has never been watched.

`lib/runtime-data.json` stores sourced film runtimes and individual episode lengths, with links and a checked date. This snapshot is maintained separately: **Refresh updates the sheet and Bluesky, not runtime research.** Unknown runtimes are excluded from the known subtotal and listed under a collapsed unresolved-issues disclosure, not treated as zero-length titles.

## Planning controls

- Check or uncheck remaining titles to include them in your plan. Checkbox targets are **44 × 44 CSS pixels**, with a visible 24-pixel checkbox, hover/press feedback and keyboard focus styling. Selections update totals immediately.
- **Include all remaining** and **Clear plan** provide bulk selection.
- Adjust daily pace and target date to see viewing days and a projected finish date for known runtimes.
- **Don’t count end credits** defaults off. When enabled, an adjustable deduction defaults to **5 minutes per movie or episode**, preserving at least one minute per part. This is an **estimate**, not measured credit boundaries. It may include post-credit scenes; the original sourced runtimes remain visible in title details.
- The desktop right-hand planner stays pinned at the top while the watchlist scrolls. On shorter screens its contents scroll independently so all controls remain reachable. On mobile it stacks above the list without covering it.
- Unresolved-title details are **collapsed by default** beneath the issue count. Expand the disclosure to see what is not yet included.

Selections, pace, target date and credit settings persist in the current browser’s local storage; they do not sync between devices. The last successful source response is cached if refresh fails.

## Local development

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

Open the local URL printed by the server. This project uses React, Vinext/Vite and a Cloudflare Worker-compatible API route.

```sh
node --test lib/planner.test.mjs lib/runtime.test.mjs
npx tsc --noEmit
npm run build
npm run start
```

On Windows, if the shell cannot locate npm correctly, invoke the installed `npm-cli.js` with Node. No application API keys are required for the public Google Sheet and Bluesky reads.

## Code map

- `app/page.tsx`: dashboard, selection controls and browser-local settings.
- `app/globals.css`: responsive layout, pinned planner and larger click targets.
- `app/api/rewatch/route.ts`: read-only source refresh endpoint.
- `lib/rewatch.mjs`: CSV parsing, review matching and reconciliation.
- `lib/runtime-data.json`: runtime records and episode/source links.
- `lib/planner.mjs`: credit-adjusted viewing-time calculation.
- `lib/*.test.mjs`: runtime and calculation regression tests.
- `.openai/hosting.json`: existing Sites identity and hosting configuration, not credentials.

## Deployment and repository safety

The site is hosted through Sites. Preserve its existing project ID and access configuration when publishing. GitHub stores the source; pushing to GitHub alone does not deploy the site.

Credentials, environment files, dependencies, generated output, local runtime state, scratch research and screenshots are excluded through `.gitignore`. The supplied `build/` files are maintained deployment source, not generated output, and are intentionally tracked.

## Runtime limitations

Sources report rounded minutes. Editions, regional cuts, recaps and platform credits can differ. Unreleased or unverified entries stay unresolved until their runtime records are updated. Finish dates assume selected titles are available and do not schedule around release dates.
