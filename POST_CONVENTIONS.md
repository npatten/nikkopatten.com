# Post Conventions

Markdown and HTML conventions that affect how posts render on the site. Shared between this repo and the scriptorium draft repo — keep this file as the single source of truth.

## Writing rules

- **NEVER use em-dashes.** Start a new sentence, or use a colon.
- Always use `loading="lazy"` on `<img>` and `<video>`.
- Short slugs. Prefer 2–4 words.

## Figures and videos

Image with caption:

```html
<figure>
  <img src="media/foo.png" loading="lazy" />
  <figcaption>Caption text</figcaption>
</figure>
```

Video — closing tag MUST be on its own line:

```html
<video src="media/foo.mp4" controls></video>
```

## Scrollable / long code blocks

Wrap them so they scroll with a fade. Blank lines around the fenced block are required:

````html
<div class="code-preview">

```typescript
// code
```

</div>
````

## Special markdown features

- `%%toc%%` — auto-generate a table of contents from `<h2>`, `<h3>`, `<h4>`. Wrap in `<div class="toc">%%toc%%</div>`.
- Inline math: `$...$`. Block math: `$$...$$`.
- `<q-l href="..."></q-l>` — styled quote link icon. Homepage/about only, not posts.

## Gotchas

- Don't indent content inside `<% for (...) { %>` loops in Markdown — Markdown will treat it as a code block.
- `.md` files go through Marked, so raw HTML is allowed but mind blank-line rules around block elements.
