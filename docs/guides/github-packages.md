# Publishing Frame to GitHub Packages

Frame starts at version `0.1.0`. Workspace names remain `@frame/*`.
The packaging script creates separate manifests for GitHub under
`@poziel/frame-core`, `@poziel/frame-themes`, `@poziel/frame-tailwind`,
`@poziel/frame-tauri`, and `@poziel/frame-electron`. Optional modules ship in Core.
The repository root and Docs application are never published.

## Automatic builds on main

Every push to `main`, including a merged pull request, runs checks and publishes
all five packages. Development versions use the base version plus the workflow
run number and attempt, for example `0.1.0-dev.12.1`. Re-running a workflow creates
a different version. The registry tag `next` points to the latest successful
development publication; `latest` remains reserved for stable releases.
Workspace versions stay unchanged. Optional packages require the matching
development Core version through their peer dependencies.

Pull requests targeting `main` run the same validation and produce archives,
but never publish. Manual workflow runs also only validate and pack.

## Verify before publishing

Push the changes to GitHub, then open **Actions → GitHub Packages → Run workflow**.
This builds, checks, tests, and packs the libraries without publishing them.
Download the `frame-packages` artifact to inspect all five package archives.
Local packaging uses `node scripts/pack-github.mjs` after the library, theme,
and host builds. The script requires every declared package file to exist.

## Publish a version

1. Update the root and all five library versions together, including Core peer
   dependency ranges when needed, and refresh `bun.lock` with `bun install`.
2. Commit and push to `main`. Verify the automatic development publication succeeds.
3. On GitHub, create a release targeting that commit with a matching tag,
   initially `v0.1.0`. Publish the release to trigger package publication.

Publishing requires Actions to be enabled. The workflow uses its built-in
`GITHUB_TOKEN` with `packages: write`; no personal publishing token is needed.
Tag and manifest versions must match. Each registry package version can only
be published once. If publication fails partway through, inspect the registry
before retrying; already published versions cannot simply be overwritten.
The first published packages are private by default; configure visibility and
consumer access in each package's GitHub settings.

## Install in another application

Configure the application's `.npmrc`:

```ini
@poziel:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Set `NODE_AUTH_TOKEN` locally to a GitHub personal access token (classic) with
`read:packages` and access to the packages. Never commit the token.

```sh
bun add '@frame/core@npm:@poziel/frame-core@0.1.0' '@frame/themes@npm:@poziel/frame-themes@0.1.0'
bun add --dev '@frame/tailwind@npm:@poziel/frame-tailwind@0.1.0'
```

To use the current development build, replace `0.1.0` with `next` for every
package. For reproducible installs, use the same exact development version for
all packages, such as `0.1.0-dev.12.1`, and retain the application's lockfile.

Install adapters only when needed using the same alias pattern. Keep existing
imports such as `@frame/core` and `@frame/core/modules/editor`. Staged manifests
keep Core peer dependencies under `@frame/core` so the host's alias satisfies
their version requirement. Install Core explicitly alongside optional packages.
Applications still provide Vue, and Electron hosts provide Electron.

See GitHub's [npm registry documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
for authentication, permissions, and package visibility.
