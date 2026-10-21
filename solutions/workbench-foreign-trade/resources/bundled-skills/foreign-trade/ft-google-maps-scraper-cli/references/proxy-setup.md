# Proxy Setup

## When to recommend a proxy

A proxy is optional for a small validation or shallow crawl. Recommend considering one for many queries, higher concurrency, grid coverage, repeated crawls, or when Google blocks the local connection. Large crawls are usually run through residential proxies, which the user buys from a provider of their own choice. Explain that provider quality, geography, volume, and Google behavior all affect results.

Do not recommend specific proxy vendors. The upstream sponsor selector and referral links were removed from this skill.

## Credential entry

Run:

```bash
bash scripts/configure-proxy.sh
```

The helper accepts HTTP, HTTPS, SOCKS5, and SOCKS5H URLs. The user enters one URL at a time and submits a blank entry to finish.

If interactive input is unavailable through the agent's terminal tool, give the user the command above to run in their own terminal (from the skill directory). Wait for completion and continue using only the resulting file path. Never ask them to paste the proxy URL into chat as a fallback.

The file is stored at:

```text
${XDG_CONFIG_HOME:-$HOME/.config}/google-maps-scraper/proxies.txt
```

It is plaintext protected by `0600` filesystem permissions. Never open or print it. The helper prints the command the user can use to remove it.
