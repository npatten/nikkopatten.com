# nikkopatten.com — Agent Guide

A minimalist personal blog and portfolio built with [blargh](https://github.com/badlogic/blargh), a static site generator using EJS-style templating (`<% %>` / `<%= %>`) over Markdown + HTML.
Credit to Mario Zechner [mariozechner.at](https://github.com/badlogic/mariozechner.at).

## Project Structure

```
.
├── src/                    # Source files (blargh input)
│   ├── posts/              # Blog posts: YYYY-MM-DD-slug/
│   │   └── <slug>/
│   │       ├── index.md    # Post content (Markdown + EJS)
│   │       ├── meta.json   # Post metadata
│   │       └── media/      # Post assets (images, video)
│   ├── _css/               # Modular CSS fragments composed by style.css
│   ├── _icons/             # SVG icons, included via render()
│   ├── _partials/          # Reusable HTML templates
│   │   ├── header.html        # Shared <head> + top bar
│   │   ├── footer.html        # Shared closing
│   │   ├── post-header.html   # Per-post hero + metadata
│   │   └── post-footer.html   # Per-post footer
│   ├── components.js       # Web components: <theme-toggle>, <color-band>, <q-l>
│   ├── style.css           # Imports everything under _css/
│   ├── meta.json           # Site-level metadata
│   └── index.html          # Homepage + RSS generation
├── html/                   # Build output (git-ignored)
├── dev.sh                  # Watch + serve at :8080
├── build.sh                # Production build
└── README.md
```

Files and directories starting with `_` are NOT emitted as standalone pages by blargh. They can only be pulled in via `render()` or `meta()`.

## Common Tasks

### Import a draft from scriptorium (primary path)

Posts normally originate as markdown drafts in the scriptorium repo (`~/Projects/scriptorium/drafts/ready-for-review/<slug>.md`) and are imported here.

```bash
scripts/import-draft.sh <path-to-draft.md> [--force]
```

This creates `src/posts/YYYY-MM-DD-<slug>/` with `meta.json` (`published: false`), `index.md` (boilerplate + body), and an empty `media/`. Date is stamped at import time. Refuses if the post dir already exists unless `--force`.

After import:

1. Start the dev server if not running: `nohup ./dev.sh > /tmp/blargh.log 2>&1 &` then `open http://127.0.0.1:8080/posts/<slug>/`
2. Drop any media into `media/`. If you add a header image, add `image` and `caption` to `meta.json`.
3. Review. When ready, flip `"published": true` in `meta.json`.

### Add a new blog post manually (rare)

When drafting directly in this repo rather than via scriptorium. Scaffold immediately — do not ask for confirmation.

1. Get today's date: `date +%Y-%m-%d`
2. Create `src/posts/YYYY-MM-DD-short-slug/media/`
3. Start dev server if not running: `nohup ./dev.sh > /tmp/blargh.log 2>&1 &` then `open http://127.0.0.1:8080/posts/<slug>/`
4. Create `meta.json` (set `"published": false` until the user says to publish):
   ```json
   {
     "title": "Post Title",
     "date": "YYYY-MM-DD",
     "description": "SEO / RSS description",
     "image": "media/header.png",
     "caption": "Header image caption",
     "published": false
   }
   ```
   Omit `image` and `caption` if the post has no header image — `post-header.html` handles that.
5. Create `index.md` with this boilerplate:

   ```ejs
   <%
   	meta("../../meta.json")
   	meta()
   	const path = require('path');
   	url = url + "/posts/" + path.basename(path.dirname(outputPath)) + "/";
   %>
   <%= render("../../_partials/post-header.html", { title, image, caption, url }) %>

   <h1 class="toc-header">Table of contents</h1>
   <div class="toc">
   %%toc%%
   </div>

   Your post content here...

   <%= render("../../_partials/post-footer.html", { title, url }) %>
   ```

6. Drop the header image (if any) into `media/`.

### Post markdown conventions

Figures, videos, scrollable code blocks, em-dash rule, `loading="lazy"`, `%%toc%%`, math — see [`POST_CONVENTIONS.md`](./POST_CONVENTIONS.md). Single source of truth, shared with scriptorium.

### Development

```bash
./dev.sh
# http://127.0.0.1:8080 with live reload
```

### Build

```bash
./build.sh
# Output: ./html/
```

### Deploy

Pushing to git does NOT auto-deploy. Always run the deploy script manually after pushing:

```bash
./deploy.sh
# Builds, then deploys html/ to Cloudflare Pages via wrangler
```

## Template Functions (blargh built-ins)

- `meta(path?)` — loads JSON metadata onto `this`. Default path is `./meta.json`.
- `render(path, data?)` — renders a partial, optionally with extra context.
- `metas(dir)` — returns `[{ directory, meta }]` for all `meta.json` files under `dir`.
- `rss(path, channel, items)` — emits an RSS 2.0 file.
- `require(id)` — normal Node.js require.

Available on `this` inside any transformed file:

- `inputPath`, `outputPath`, `content`

## Styling

- Dark/light theme via `data-theme` on `<html>`, toggled by `<theme-toggle>`, persisted in `localStorage`.
- Colors in `src/_css/colors.css`.
- Tailwind-like utility classes in `src/_css/utilities.css` (hand-rolled, NOT Tailwind).
- Syntax highlighting: Atom One Dark (`src/_css/atom-one-dark-reasonable.min.css`).
- Math: KaTeX (`src/_css/katex.min.css`).
- Body max-width is 640px. Keep it.

## Post Markdown & Writing Conventions

See [`POST_CONVENTIONS.md`](./POST_CONVENTIONS.md).

## Dictation Workflow

When the user dictates paragraphs:

- Fix grammar and spelling only.
- Do NOT change tone or content.
- If the user asks for options or to "tighten it up", output suggestions in chat first and wait for confirmation before writing to a file.
- Only apply changes to the file after explicit confirmation.

## Gotchas

- Files/dirs starting with `_` are only included via `render()` / `meta()`, never output directly.
- The `html/` directory is fully regenerated by every build. Never edit it by hand.
- Additional markdown/EJS gotchas in [`POST_CONVENTIONS.md`](./POST_CONVENTIONS.md).
