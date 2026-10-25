# NUFS Racing website

The website for Northumbria University Formula Student, live at **[nufsracing.co.uk](https://nufsracing.co.uk)**.

It is a static site built with [Eleventy](https://www.11ty.dev/) and hosted on Cloudflare. There is no database or backend. Every page is built from templates and a few JSON files, so most day to day changes are just editing text in a file and pushing it.

This README is written for whoever looks after the site next. If you are new to it, read **How changes go live** before you push anything.

---

## Running it on your computer

You need [Node.js](https://nodejs.org/) installed (any recent LTS version).

```bash
npm install     # first time only
npm start       # runs the site at http://localhost:8080 and reloads when you save
npm run build   # builds the finished site into _site/
```

`_site/` is generated output. Never edit it by hand, and it is not committed.

---

## How changes go live

**Anything pushed to `main` goes straight to the live site.** Treat `main` as production.

| Branch | What it is for |
|---|---|
| `main` | The live site. Only ever updated by merging tested work into it |
| `dev` | Where finished work is gathered before it goes live |
| feature branches | One per piece of work, for example `sponsor-page` or `team-page` |

The normal workflow:

1. Branch off `dev`, for example `git checkout dev && git checkout -b team-page`
2. Make your changes and check them locally with `npm start`
3. Push the branch. Cloudflare builds a **preview link** for every branch, so you can send it to the team for sign off before anything goes live
4. Once it is approved, merge it into `dev`, then fast forward `main`:

```bash
git checkout main
git pull
git merge --ff-only dev
git push origin main
```

`--ff-only` refuses to merge if `main` has changed in a way you did not expect, which stops you accidentally creating a messy merge on the live site.

5. Check the build finished in the Cloudflare dashboard, then check the live site, ideally on a phone as well.

`wrangler.jsonc` holds the Cloudflare settings (it builds the site into `_site/` and turns on branch previews). You should not need to touch it.

---

## Changing content without touching code

Most updates only need one of the files in `src/_data/`. Edit the value, save, and the pages update.

### `site.json`, the team's details
| Field | What it controls |
|---|---|
| `members` | The member count on the home and sponsor pages |
| `season` | The season label, for example `2026/27` |
| `competition.raceDay` | The race day countdowns. `raceDayConfirmed` switches off the "date TBC" note once the date is official |
| `competition.date` | The event month shown in text, for example `July 2027` |
| `emails` | The sponsorship, general and media addresses used across the site |
| `social` | Instagram, LinkedIn and YouTube links. Leave one blank to hide it |
| `instagramMonthlyViews` | Shows "Our Instagram gets X views a month" on the sponsor page. Leave it as `""` to hide the line |
| `nav` | The links in the menu. Set `"live": true` when a page is ready to appear |
| `joinUrl` | Where the Join buttons send people (the Students' Union page) |
| `analyticsId` | The Google Analytics ID. Analytics only runs on the real domain, and visitors can turn it off in the footer |
| `credits` | The site credit in the footer |

### `tiers.json`, the sponsorship tiers
Each tier has a `name`, `price`, `summary`, `benefits` list and `foot` line. These appear on the sponsor page and in the tier list on the home page.

- `lights` is how many of the 10 rev lights are lit on that tier's card
- `inherits` adds the "Includes Community Partner" style line
- `strip: true` shows the tier as the wide strip at the top (Supporting Partner)
- `flagship: true` shows it as the big red card at the bottom (Founding Partner)
- Prices are plain text, so `"From £500"` or `"Negotiated"` both work

If the sponsorship brochure changes, this is the file to update so the site matches it.

### The other data files
- `phases.json`: the four build phases in "Our plan" on the home page. Move `"status": "now"` to whichever phase the team is in
- `events.json`: the Formula Student events and their points. The points totals on the home page add up from here, so update it if the rules change
- `subteam.json`: the sub teams. The home page counts these for the "Sub teams" figure

---

## Where everything lives

```
src/
  index.njk          home page
  sponsor.njk        sponsor page (/sponsor/)
  team.njk           placeholder, not built yet
  join.njk           placeholder, not built yet
  partners.njk       placeholder, not built yet
  _data/             the JSON files above
  _includes/
    base.njk         the shell every page uses: head, nav, footer, analytics, page titles
    partials/        reusable pieces (nav, footer, tier cards, partner logos, the racing line)
  assets/
    css/site.css     styles for the whole site
    css/sponsor.css  styles only the sponsor page loads
    js/site.js       scroll reveals, countdowns, the nav menu, the racing line
    js/sponsor.js    the reaction test, the enquiry email builder, the pinned statement scene
    img/             images, icons and the sim wheel clip
.eleventy.js         Eleventy settings and the small custom filters
```

### Adding a new page
The Team, Join and Partners pages are placeholders with `permalink: false`, which stops them being built. To start one:

1. Remove the `permalink: false` line from its front matter (or set a permalink such as `/team/`)
2. Build the page using `base.njk` as the layout, the same as `sponsor.njk`
3. When it is ready, set its `"live"` flag to `true` in the `nav` list in `site.json` so it appears in the menu

A page can load its own CSS and JS with `pageCss` and `pageJs` in its front matter, and set its own background racing line with `racingLine`. See the top of `sponsor.njk` for an example.

### Things to know
- The page title in the browser tab comes from each page's `title`, shown as `Title | NUFS Racing`
- Partner logos go in `partials/logos.njk`, and there is a comment in `sponsor.njk` marking where the partnership banner goes once sponsors sign
- Typography is Archivo and Archivo Black from Google Fonts, and the colours are set as variables at the top of `site.css`
- Scroll reveals are listed in page order near the bottom of `site.js`, each one a selector and an effect name. The effects are styled under "scroll reveals" in `site.css`
- Visitors who have reduced motion turned on in their device settings get a calmer site with the animations switched off

---

## Accounts and ownership

The site depends on a few outside accounts. **Logins do not belong in this repo.** Keep them in the team's password manager or a private document, and hand them over when committee roles change.

- **GitHub**: this repo, under the `nufsracing` organisation
- **Cloudflare**: hosting, builds and DNS for `nufsracing.co.uk`
- **Spaceship**: where the domain is registered, and the Spacemail business email
- **Google Analytics**: visitor stats

Check who owns each account before the person who set it up leaves.

---

## Credits

Built by Jack Page and Aaron Gowreea for the 2026/27 season.
