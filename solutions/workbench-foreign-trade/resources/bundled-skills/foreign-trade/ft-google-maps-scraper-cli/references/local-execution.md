# Local Execution

## Validation run

Create one representative query file and a validation output directory. Run:

```bash
bash "$SKILL_DIR/scripts/run-local.sh" \
  --queries gmaps/validation-queries.txt \
  --output-dir gmaps/validation-output \
  --depth 1
```

When configured, add:

```bash
--proxy-file "${XDG_CONFIG_HOME:-$HOME/.config}/google-maps-scraper/proxies.txt"
```

Add `--format json`, `--email`, `--extra-reviews`, `--lang CODE`, or a different positive depth only when selected. Extra reviews require JSON.

The helper uses container `gmaps-scraper-agent`, volume `gmaps-playwright-cache`, image `gosom/google-maps-scraper` (override with `GMAPS_IMAGE=<image:tag or @digest>` to pin a version), `-e DISABLE_TELEMETRY=1`, and `-exit-on-inactivity 3m`. It pulls the image only when it is not present locally, or when `--pull` is passed because the user asked to update. It retries one failed pull. When a local image already exists and both attempts fail, it warns and continues with the local image; without a local image, it stops with an actionable error.

## Status

For CSV:

```bash
node "$SKILL_DIR/scripts/status-local.mjs" \
  --output gmaps/validation-output/results.csv \
  --format csv
```

For JSON, point to `results.json` and use `--format json`. The helper returns JSON with container state, elapsed seconds, result count, output path, and exit code when completed.

## Full run

After validation succeeds, run the complete query file with a descriptive output directory. The image is reused; it is never refreshed implicitly. The helper safely removes only a stopped container named `gmaps-scraper-agent`; it refuses to replace a running crawl.

Do not use `--dry-run` for an actual crawl. `--dry-run` exists for diagnostics and prints a command containing the proxy file path, never its contents.
