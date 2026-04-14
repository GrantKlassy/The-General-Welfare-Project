# The General Welfare Project

America first. Pro-freedom. Pro-human-rights. Every line of code, every page, every design decision in this repo serves the people of the United States. When a law, regulation, or system puts corporations over human beings --- that is what this project exists to push back against. Human beings always win. America always win. USA forever.

This is a resource site that connects Americans to their rights. It is designed for the underprivileged --- low-end devices, slow networks, zero tracking. Black background for battery life, Inclusive Sans for readability, aggressive privacy. When building features, writing copy, or making architecture decisions, always ask: does this serve the person on the other end?

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
