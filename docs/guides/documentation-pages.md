# Hosting Frame documentation

The **Documentation Pages** workflow builds the documentation website and
deploys it to GitHub Pages on every push or merge to `main`. It can also be run
manually from Actions. Package publication runs in a separate workflow.

The intended public address is **https://frame.poziel.dev/**. The site uses
root-relative asset URLs and hash navigation, so it needs no server-side route
fallback when hosted at this domain.

## One-time GitHub setup

1. In `poziel/frame`, open **Settings → Pages**.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Set the custom domain to `frame.poziel.dev` and save.
4. At the DNS provider for `poziel.dev`, add a **CNAME** record with name `frame`
   and target `poziel.github.io`. The target has no protocol or repository path.
5. Once GitHub validates DNS and provisions the certificate, enable
   **Enforce HTTPS** in Pages settings.
6. Run **Actions → Documentation Pages → Run workflow** on `main` if the first
   automatic run occurred before Pages was enabled.

GitHub Actions deployments use the custom domain configured in Pages settings.
A repository `CNAME` file does not configure the domain for this deployment mode.
DNS records and Pages settings are managed outside the workflow.

If the `github-pages` environment has deployment protection rules, allow `main`.
DNS validation and certificate provisioning can take time after the record changes.

## Build and verify locally

```sh
bun install --frozen-lockfile
bun run build:library
bun run build:themes
bun run build
bun run preview
```

The deployment artifact is `packages/docs/dist`; it includes `index.html`,
compiled assets, and the repository's public branding assets. No npm registry
credentials are needed for this workflow.

GitHub Pages serves static files. Examples that require the local Vite demo
server, such as `/api/chat-demo`, need that server locally and do not gain a
backend from Pages hosting.

See GitHub's [custom workflow guide](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
and [custom domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
