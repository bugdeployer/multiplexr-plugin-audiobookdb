# AudiobookDB metadata for Multiplexr

Search adapter for the AudiobookDB API. Returns book-level title, authors, language, publication date and series. Recording-specific narrator and publisher data are not included.

**Network requests are disabled by default.** AudiobookDB requires a [written integration agreement](https://audiobookdb.org/docs#eligibility-and-written-agreements) for public applications, including free apps. A personal API key is not that approval. This adapter has fixture tests; it has not been exercised against the live API.

When this use has approval, allow your audiobook collection and `https://audiobookdb.org`, configure your API key in **Manage > Credentials**, and enable the approval setting in **Manage > Settings**. The host supplies `X-API-Key`; the script cannot read it.

## Install

Requires the patched Multiplexr plugin host (0.5.1 or newer). Download the signed `.mpx.json` from Releases and install it through **Settings > Plugins & themes**. Review access before enabling. The 0.1.0 release was a starter and has no metadata handler.

## Development

Node.js 22 or newer.

```sh
npm ci
npm run check
npm test
npm run build
```

Tests use the bundled plugin entrypoint with host fixtures, not service credentials. To sign, run `npm run sign -- --key /private/publisher.pem`. Keep the publisher key outside the repository. The release workflow uses the `PLUGIN_SIGNING_KEY` Actions secret.

[Plugin SDK](https://github.com/bugdeployer/Multiplexr/tree/main/packages/multiplexr_plugin_sdk) · GPL-3.0-only.
