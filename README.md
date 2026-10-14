# Marvel Rewatch

Ayush’s Marvel rewatch dashboard: a watchlist, Bluesky review journal, and viewing-time planner.

The interface is written for visitors following Ayush's rewatch. Keep labels neutral and concise, preserve “Every universe. Every detour. One watchlist.”, and avoid owner-directed instructions or repeated explanations. Detailed calculation caveats live in a collapsed disclosure and title details; the planner clearly identifies assumptions and browser-local settings.

- **Live site:** https://ayush-marvel-rewatch.yellow-field-6391.chatgpt.site
- **Source repository:** https://github.com/AyushMahajan06/marvel-rewatch (private)

## Sources of truth

The Google Sheet’s **Manual** tab defines the list and order. Bluesky posts supply completed rewatch entries and explicit ratings. The app reads both through `/api/rewatch`; it never edits the sheet or publishes posts. A missing review is not proof that a title has never been watched.

Two explicit planning overrides apply to fresh responses and older browser caches: **Avengers: Doomsday is a ticketed event on December 17, 2026, not a rewatch entry**, so it is excluded from counts and viewing time; **Vision Quest uses a user-requested six-hour season assumption**, clearly labeled rather than presented as a verified runtime. Its individual episode runtimes remain unknown. Neither override changes the Manual sheet.

`lib/runtime-data.json` stores sourced film runtimes and individual episode lengths, with links and a checked date. This snapshot is maintained separately: **Refresh updates the sheet and Bluesky, not runtime research.** Unknown runtimes are excluded from the known subtotal and listed under a collapsed unresolved-issues disclosure, not treated as zero-length titles.

## Planning controls

Captain America (1944) is treated as **Watched**, with the same green tick as other watched entries and no partial-viewing label. The override applies to fresh responses and older browser caches without changing the source sheet. The watchlist defaults to **All**. The full-list total appears beneath **Still to watch**. No rating is invented.

`lib/posters.json` maps all 132 rewatch entries to public Wikipedia/TVmaze artwork, with source links, matched titles and artwork type. Posters load lazily with an icon fallback for unavailable images. Details show attribution and whether artwork is season-specific or series-wide; Endgame Encore explicitly reuses the standard Endgame poster. Images remain remotely hosted, not committed as binaries. TVmaze data is attributed under CC BY-SA; Wikipedia file pages carry individual rights information, and film posters are not represented as freely licensed. Refresh does not redo artwork matching.

- **Adjust plan** is off by default and resets off on reload. Normal viewing shows green ticks for watched titles and no symbol for remaining titles. Turn it on to check or uncheck remaining entries and reveal **Include all remaining** / **Clear plan**. Turning it off hides the controls, preserving selections and totals. It does not change watch status or ratings.
- Checkbox targets are **44 × 44 CSS pixels**, with a visible 24-pixel checkbox, hover/press feedback and keyboard focus styling. Selections update totals immediately.
- Adjust daily pace and target date to see viewing days and a projected finish date for known runtimes.
- The default target is the **December 17, 2026 Doomsday ticket date**. The former December 18 default migrates to December 17; other custom target dates are preserved.
- **Don’t count end credits** defaults off. When enabled, an adjustable deduction defaults to **5 minutes per movie or episode**, preserving at least one minute per part. This is an **estimate**, not measured credit boundaries. It may include post-credit scenes; the original sourced runtimes remain visible in title details.
- For Vision Quest, credit skipping deducts from the assumed season total using its listed episode count, without inventing individual episode lengths.
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
node --test lib/planner.test.mjs lib/runtime.test.mjs tests/planner-ui.test.mjs tests/posters.test.mjs
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
- `lib/rewatch-policy.mjs`: explicit rewatch exclusions, ticket date and labeled runtime assumptions.
- `lib/planner-ui.mjs`: validated browser settings and Pacific calendar-date calculations.
- `lib/*.test.mjs`: runtime and calculation regression tests.
- `.openai/hosting.json`: existing Sites identity and hosting configuration, not credentials.

## Deployment and repository safety

The site is hosted through Sites. Preserve its existing project ID and access configuration when publishing. GitHub stores the source; pushing to GitHub alone does not deploy the site.

Credentials, environment files, dependencies, generated output, local runtime state, scratch research and screenshots are excluded through `.gitignore`. The supplied `build/` files are maintained deployment source, not generated output, and are intentionally tracked.

## Runtime limitations

Sources report rounded minutes. Editions, regional cuts, recaps and platform credits can differ. Unreleased or unverified entries stay unresolved unless explicitly covered by a labeled user planning assumption. Finish dates assume selected titles are available and do not schedule around release dates.
