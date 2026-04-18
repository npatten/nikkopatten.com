# nikkopatten.com

My personal site and blog. Built with [blargh](https://github.com/badlogic/blargh), a tiny static site generator by Mario Zechner.

The structure is heavily inspired by (and partially derived from) [mariozechner.at](https://github.com/badlogic/mariozechner.at), MIT-licensed. See `LICENSE.blargh-template` for attribution.

Shout out to the amazing work by the folks at [WelchLabs](https://www.welchlabs.com/) for inspiring the main page visual.
[Specifically this incredible video they did](https://www.youtube.com/watch?v=D8GOeCFFby4&t=1649s)

## Prerequisites

- [Node.js 20+](https://nodejs.org)
- blargh installed globally:
  ```bash
  npm install -g @mariozechner/blargh
  ```

## Develop

```bash
./dev.sh
```

Opens a live-reload server at <http://127.0.0.1:8080>. Changes to anything under `src/` rebuild and refresh automatically.

## Build

```bash
./build.sh
```

Outputs the static site to `./html/`. That folder is the deployable artifact: upload it anywhere (static host, S3+CloudFront, GitHub Pages, Netlify, a $5 VPS, etc.).

## Project layout

```
.
├── src/                      # Input — everything here is transformed by blargh
│   ├── index.html            # Homepage (also generates /rss.xml)
│   ├── meta.json             # Site-level metadata (title, description, url)
│   ├── style.css             # Composes the CSS fragments in _css/
│   ├── components.js         # Vanilla web components: <theme-toggle>, <color-band>, <q-l>
│   ├── _css/                 # CSS fragments (ignored as top-level pages, _-prefixed)
│   ├── _icons/               # SVG icons, included via render()
│   ├── _partials/            # Reusable HTML fragments
│   │   ├── header.html       # <head> + top bar for all pages
│   │   ├── footer.html       # Privacy note + closing tags
│   │   ├── post-header.html  # Per-post header (title, date, optional image)
│   │   └── post-footer.html  # Per-post footer
│   └── posts/                # One directory per post (YYYY-MM-DD-slug)
│       └── <slug>/
│           ├── index.md      # Post content
│           ├── meta.json     # Post metadata
│           └── media/        # Images/videos for the post
├── html/                     # Build output (git-ignored)
├── dev.sh                    # Local dev server
└── build.sh                  # Production build
```

## Writing a post

1. `mkdir -p src/posts/$(date +%Y-%m-%d)-my-slug/media`
2. Create `meta.json`:
   ```json
   {
     "title": "My post title",
     "date": "YYYY-MM-DD",
     "description": "One-line SEO / RSS description.",
     "image": "media/header.png",
     "caption": "Optional caption for the header image.",
     "published": true
   }
   ```
   Omit `image`/`caption` if the post has no header image. Set `published` to `false` to keep a draft out of the index and RSS feed.
3. Create `index.md` with the standard boilerplate (copy from `src/posts/2026-04-17-hello-world/index.md`).
4. Write.

## Features out of the box

- Markdown with GFM, fenced code blocks, `highlight.js` syntax highlighting
- KaTeX math (`$inline$` and `$$block$$`)
- Auto table of contents with `%%toc%%`
- Dark / light mode toggle (persisted in `localStorage`)
- Auto-generated `/rss.xml`
- OpenGraph + Twitter Card meta tags
- Zero client-side framework — just a single 4KB `components.js` with vanilla web components

## Conventions

- Post slugs: `YYYY-MM-DD-kebab-case`
- Post images: inside the post's `media/` folder, reference as `media/foo.png`
- For scrollable code previews, wrap in `<div class="code-preview">...</div>`
- For videos: `<video src="..."></video>` with the closing tag on its own line (Markdown parser quirk)
- External link icons on the homepage: `<q-l href="..."></q-l>` (home page only)

## Attribution

Scaffolding derived from [badlogic/mariozechner.at](https://github.com/badlogic/mariozechner.at) (MIT). See `LICENSE.blargh-template` and the upstream repo for details.
