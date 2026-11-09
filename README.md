# Marvel Rewatch

**Every universe. Every detour. One watchlist.**

I'm Ayush, and I turned a Marvel rewatch into a 132-entry commitment. Movies, entire TV seasons, specials, and a 1944 Captain America serial all made the list. The destination is my December 17, 2026 ticket for Avengers: Doomsday. The route includes some very questionable filmmaking.

This is the dashboard for that increasingly unhinged journey. I post my progress and ratings on Bluesky, and the site turns those posts into a watchlist, review journal, and answer to the question "How many hours of this do I still have left?"

[Explore the watchlist](https://ayush-marvel-rewatch.yellow-field-6391.chatgpt.site/) · [Follow the reviews](https://bsky.app/profile/ayushm.bsky.social)

## What it does

- Tracks watched titles and pulls my ratings from Bluesky.
- Shows posters, review links, film runtimes and individual episode lengths.
- Lets visitors adjust which remaining titles to include in a viewing plan.
- Calculates remaining hours, daily pace and a projected finish date.
- Offers an optional estimated deduction for end credits.
- Keeps planning preferences in the current browser.

The list mixes MCU entries with detours across Marvel adaptations. Doomsday is the finish-line event and is excluded from the rewatch count. Captain America (1944) counts as watched. My ratings are entirely subjective, occasionally generous, and probably worth arguing about.

## How it works

The Google Sheet's Manual tab defines the titles and order. A server endpoint fetches the public Sheet CSV and my public Bluesky feed, then reconciles reviews with the watchlist.

The parser handles title aliases, release years, season notation, combined reviews and ratings in reply posts. Combined scores are identified as shared. Explicit overrides handle the rewatch's few exceptions. All of this runs through ordinary application code, with no LLM or AI API dependency.

Film runtimes and episode lengths are maintained in a separate attributed data snapshot. Missing runtimes remain unresolved and are excluded from the known subtotal. Vision Quest uses an explicitly requested six-hour assumption. Credit skipping uses a configurable estimate per film or episode, rather than measured credit boundaries.

## Engineering choices

- React and TypeScript for the dashboard and interactive controls.
- A Next.js-style App Router structure, currently built with Vinext/Vite for Cloudflare Workers through Sites.
- A read-only API route for source reconciliation.
- Pure calculation and validation modules for viewing time, settings and Pacific calendar dates.
- Browser-local persistence with a last-successful-response fallback when source refresh fails.
- Lazy-loaded artwork, attribution links and image-error fallbacks.
- Responsive layouts, keyboard focus indicators and large checkbox targets.

A migration to standard Next.js on Vercel is planned. The current deployment is still hosted through Sites.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

Open the local URL printed by the server. Public source reads require no application API keys.

```sh
node --test lib/planner.test.mjs lib/runtime.test.mjs tests/planner-ui.test.mjs tests/posters.test.mjs
npx tsc --noEmit
npm run build
npm run start
```

## Project structure

| Location | Responsibility |
| --- | --- |
| app/page.tsx | Dashboard, filters, reviews and planning controls |
| app/globals.css | Responsive layout and visual styles |
| app/api/rewatch/route.ts | Source refresh endpoint |
| lib/rewatch.mjs | CSV parsing, review extraction and title matching |
| lib/rewatch-policy.mjs | Rewatch-specific count and runtime rules |
| lib/planner.mjs | Viewing-time and credit calculations |
| lib/planner-ui.mjs | Settings validation and calendar calculations |
| lib/runtime-data.json | Attributed runtimes and episode records |
| lib/posters.json | Artwork mappings and attribution |
| lib/*.test.mjs and tests/ | Calculation, reconciliation and UI regression checks |

## Data and limitations

Refresh updates the Sheet and Bluesky data. Runtime research and poster matching are maintained separately in the repository. Sources report rounded minutes, and cuts, editions, recaps and credits can differ. Finish dates assume the selected titles are available.

Planning selections are saved per browser and domain. They do not sync across devices or change my published watched status. An entry without a matched review stays in Remaining until it is reconciled.

Artwork comes from public Wikipedia and TVmaze sources. Season-specific artwork is used where available, with series artwork as a fallback. Endgame Encore reuses the standard Endgame poster. Third-party artwork retains its own rights, and each item's details link to its source.

## Deployment

GitHub holds the source. The current Sites deployment uses a separate publish workflow, so a GitHub push alone does not deploy it. The planned Vercel migration will connect production deployments to main.

Environment files, credentials, dependencies, generated output and local research artifacts are excluded from version control.
