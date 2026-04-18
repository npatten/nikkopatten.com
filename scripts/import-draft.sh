#!/usr/bin/env bash
# Import a scriptorium draft into src/posts/.
#
# Usage: scripts/import-draft.sh <path-to-draft.md> [--force]
#
# Reads YAML frontmatter (title, description required), strips it, and emits:
#   src/posts/YYYY-MM-DD-<slug>/meta.json
#   src/posts/YYYY-MM-DD-<slug>/index.md   (boilerplate + body)
#   src/posts/YYYY-MM-DD-<slug>/media/     (empty)
#
# Date is stamped at publish time. `published` is always false.
# Refuses if post dir already exists unless --force.
#
# Prints the created post path on success (for callers to consume).

set -euo pipefail

DRAFT_PATH="${1:-}"
FORCE="${2:-}"

if [[ -z "$DRAFT_PATH" ]]; then
  echo "usage: $0 <path-to-draft.md> [--force]" >&2
  exit 2
fi

if [[ ! -f "$DRAFT_PATH" ]]; then
  echo "error: draft not found: $DRAFT_PATH" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
POSTS_DIR="$REPO_ROOT/src/posts"

SLUG="$(basename "$DRAFT_PATH" .md)"
DATE="$(date +%Y-%m-%d)"
POST_DIR="$POSTS_DIR/${DATE}-${SLUG}"

# Warn if repo is dirty.
if [[ -n "$(cd "$REPO_ROOT" && git status --porcelain 2>/dev/null)" ]]; then
  echo "warning: $REPO_ROOT has uncommitted changes" >&2
fi

if [[ -d "$POST_DIR" && "$FORCE" != "--force" ]]; then
  echo "error: $POST_DIR already exists. Pass --force to overwrite." >&2
  exit 1
fi

# Parse frontmatter with awk. Extract title and description. Strip frontmatter from body.
FRONTMATTER="$(awk '
  BEGIN { in_fm=0; n=0 }
  NR==1 && /^---[[:space:]]*$/ { in_fm=1; next }
  in_fm && /^---[[:space:]]*$/ { in_fm=0; next }
  in_fm { print }
' "$DRAFT_PATH")"

if [[ -z "$FRONTMATTER" ]]; then
  echo "error: draft has no YAML frontmatter" >&2
  exit 1
fi

get_field() {
  local key="$1"
  # Matches: key: value   or   key: "value"
  printf '%s\n' "$FRONTMATTER" \
    | awk -v k="$key" '
        $0 ~ "^"k":" {
          sub("^"k":[[:space:]]*","")
          # strip surrounding quotes
          if (match($0, /^".*"$/)) { $0 = substr($0, 2, length($0)-2) }
          if (match($0, /^\x27.*\x27$/)) { $0 = substr($0, 2, length($0)-2) }
          print; exit
        }'
}

TITLE="$(get_field title)"
DESCRIPTION="$(get_field description)"

if [[ -z "$TITLE" ]]; then
  echo "error: frontmatter missing required field: title" >&2
  exit 1
fi
if [[ -z "$DESCRIPTION" ]]; then
  echo "error: frontmatter missing required field: description" >&2
  exit 1
fi

BODY="$(awk '
  BEGIN { in_fm=0; done=0 }
  NR==1 && /^---[[:space:]]*$/ { in_fm=1; next }
  in_fm && /^---[[:space:]]*$/ { in_fm=0; done=1; next }
  in_fm { next }
  done || NR>1 { print }
' "$DRAFT_PATH")"

# JSON-escape a string (quotes, backslashes, control chars).
json_escape() {
  python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().rstrip("\n")))' <<<"$1"
}

mkdir -p "$POST_DIR/media"

cat >"$POST_DIR/meta.json" <<EOF
{
    "title": $(json_escape "$TITLE"),
    "date": "$DATE",
    "description": $(json_escape "$DESCRIPTION"),
    "published": false
}
EOF

cat >"$POST_DIR/index.md" <<'HEADER'
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

HEADER

printf '%s\n' "$BODY" >>"$POST_DIR/index.md"

cat >>"$POST_DIR/index.md" <<'FOOTER'

<%= render("../../_partials/post-footer.html", { title, url }) %>
FOOTER

echo "$POST_DIR"
