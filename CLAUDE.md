# The General Welfare Project

America first. Pro-freedom. Pro-human-rights. Every line of code, every page, every design decision in this repo serves the people of the United States. When a law, regulation, or system puts corporations over human beings --- that is what this project exists to push back against. Human beings always win. America always win. USA forever.

This is a resource site that connects Americans to their rights. Mobile-first, zero tracking, aggressive privacy. Designed for 360px budget Android as the minimum viewport --- that's where most smartphone-only Americans live. Black background for OLED battery life, Inclusive Sans for readability, fast on slow networks. When building features, writing copy, or making architecture decisions, always ask: does this work on a $150 phone over LTE?

## Device Targets

Design mobile-first. The minimum viewport is **360px wide** (budget Android baseline: Samsung A-series, Moto G). All layouts, components, and interactions must work at this width before scaling up.

Test at these viewports:
- **360×800** — budget Android (minimum target)
- **390×844** — mid-range iPhone
- **414×896** — larger iPhone
- **402×874** — modern iPhone (iPhone 18)
- **1920×1080** — desktop

Assume slow connections, older Android OS versions, and multi-language needs. Large tap targets, high contrast, and i18n support are non-negotiable. Playwright tests must cover all five viewports.

## Repo Standards

Enforced by lefthook hooks and `task check`.

## Commits

- **Never add `Co-Authored-By` trailers to commit messages.** Not as a suggestion, not as a default, not ever. Do not attempt it. Lefthook hooks reject them, but do not rely on the hooks — simply never write the trailer. GitHub counts Co-Authored-By as contributors and it misrepresents authorship.
- All commits must be authored as `GrantKlassy`. The git identity is managed by `~/.gitconfig` includeIf — do not set it locally.
- Push via the `github.com-gk` SSH alias only.

## Plugins

The only allowed plugin is `frontend-design@claude-plugins-official`. Do not enable, install, or suggest any other plugins.

## Hosting

Cloudflare Pages. Project name: `the-general-welfare-project`. Custom domain: `generalwelfareproject.com` + `www.generalwelfareproject.com`.

Deploy: `pnpm run build && wrangler pages deploy dist/ --project-name=the-general-welfare-project --branch=main`

## Directives

- `directives/` is the user's space. **Never create, edit, or delete files in `directives/`.** Enforced by lefthook, but do not rely on the hook.
- Read files there to understand project intent. If something should change, tell the user.
