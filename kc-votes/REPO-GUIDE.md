# How to Create a New Repo and Ship a Static Site

A complete, copy-paste guide for taking a plain HTML/CSS/JS site from zero to live on GitHub Pages — exactly how `kc-votes` was built.

---

## Step 1 — Create the Repository on GitHub

1. Go to **github.com → New repository** (or `github.com/new`).
2. Fill in:
   - **Repository name** — e.g. `kc-votes` (lowercase, hyphens only)
   - **Description** — one line, optional but good for discoverability
   - **Public** — required for free GitHub Pages hosting
   - Leave "Initialize with README" **unchecked** (we'll do it locally)
3. Click **Create repository**.

GitHub shows you the empty-repo setup screen — keep it open for Step 3.

---

## Step 2 — Set Up the Project Locally

```bash
# Create the project folder and enter it
mkdir kc-votes && cd kc-votes

# Initialize git
git init

# Create your three core files
touch index.html styles.css app.js
```

Your folder structure:

```
kc-votes/
├── index.html
├── styles.css
└── app.js
```

For anything larger, add folders as you need them:

```
kc-votes/
├── index.html
├── assets/
│   ├── styles.css
│   ├── app.js
│   └── images/
└── pages/
    └── about.html
```

---

## Step 3 — Connect Local Repo to GitHub

Copy the remote URL from the GitHub empty-repo screen, then run:

```bash
git remote add origin https://github.com/YOUR-USERNAME/kc-votes.git
git branch -M main
```

Verify the remote is set correctly:

```bash
git remote -v
# origin  https://github.com/YOUR-USERNAME/kc-votes.git (fetch)
# origin  https://github.com/YOUR-USERNAME/kc-votes.git (push)
```

---

## Step 4 — Build the Site

Open `index.html`, `styles.css`, and `app.js` in your editor and build your site.
The `kc-votes` site in this folder is a working reference — feel free to use it as a starting point.

A minimal `index.html` skeleton to start from:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Site Title</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Hello, world.</h1>
  <script src="app.js"></script>
</body>
</html>
```

---

## Step 5 — First Commit and Push

```bash
# Stage everything
git add index.html styles.css app.js

# Commit
git commit -m "Initial site: HTML structure, styles, and JS"

# Push
git push -u origin main
```

After the first push, `-u origin main` sets the upstream so future pushes are just `git push`.

---

## Step 6 — Enable GitHub Pages

1. Go to your repo on GitHub → **Settings → Pages**.
2. Under **Source**, select **Deploy from a branch**.
3. Branch: **main**, Folder: **/ (root)** → **Save**.
4. GitHub shows a banner: _"Your site is live at `https://YOUR-USERNAME.github.io/kc-votes/`"_

This usually takes 30–90 seconds on the first deploy.

---

## Step 7 — Ongoing Workflow

Every time you make changes:

```bash
# Check what changed
git status

# Stage specific files (prefer this over `git add .`)
git add index.html styles.css

# Commit with a clear message
git commit -m "feat: add FAQ section and mobile nav"

# Push — GitHub Pages redeploys automatically
git push
```

GitHub Pages redeploys on every push to `main`. Changes go live within ~60 seconds.

---

## Optional Extras

### Custom Domain
1. Add a file named `CNAME` in the repo root with your domain on one line: `votes.yourdomain.com`
2. Point your domain's DNS to GitHub Pages IPs (see GitHub docs).
3. In **Settings → Pages**, enter your custom domain and enable HTTPS.

### Add a `.gitignore`
```bash
# Create a .gitignore so you never accidentally commit junk
cat > .gitignore << 'EOF'
.DS_Store
Thumbs.db
*.log
node_modules/
.env
EOF
git add .gitignore && git commit -m "chore: add .gitignore"
```

### Validate HTML
```bash
# Quick syntax check via npx (no install required)
npx html-validate index.html
```

### Lint CSS
```bash
npx stylelint styles.css --config '{"extends":"stylelint-config-standard"}'
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Initialize repo | `git init` |
| Stage all changes | `git add <files>` |
| Commit | `git commit -m "message"` |
| Push (first time) | `git push -u origin main` |
| Push (after setup) | `git push` |
| View status | `git status` |
| View history | `git log --oneline` |
| View live diff | `git diff` |

---

## What's in `kc-votes/`

| File | Purpose |
|------|---------|
| `index.html` | Full semantic HTML — nav, hero, stats, steps, timeline, polling, notify form, FAQ, resources, footer |
| `styles.css` | CSS custom properties design system — responsive from 320px to 1440px+ |
| `app.js` | Sticky nav, mobile menu, scroll-triggered counters, FAQ accordion, form validation |

All three files are zero-dependency — no build step, no npm, no bundler. Open `index.html` in a browser and it works.
