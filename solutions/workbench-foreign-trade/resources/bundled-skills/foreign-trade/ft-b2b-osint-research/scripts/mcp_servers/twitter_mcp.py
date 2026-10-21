"""
Twitter/X MCP Server
Wraps twitter-cli (public-clis/twitter-cli) for Twitter OSINT.
Cookie-based auth, zero API fees.

Tools:
  twitter_search       — search tweets by keyword with filters
  twitter_read_tweet   — read a specific tweet + replies
  twitter_user_profile — get user profile info
  twitter_user_posts   — get a user's recent tweets
"""

import json
import os
import subprocess
import yaml
from fastmcp import FastMCP

mcp = FastMCP(
    "twitter",
    instructions=(
        "Twitter/X OSINT tool. "
        "twitter_search: find tweets by keyword, filter by user/date/lang. "
        "twitter_user_profile: get public profile info for a Twitter handle. "
        "twitter_user_posts: get recent tweets from a specific user. "
        "twitter_read_tweet: read a specific tweet and its replies by ID."
    ),
)

_TWITTER_BIN = "twitter"


def _env() -> dict:
    """Build env dict with Twitter credentials."""
    env = os.environ.copy()
    env["TWITTER_AUTH_TOKEN"] = os.environ.get("TWITTER_AUTH_TOKEN", "")
    env["TWITTER_CT0"] = os.environ.get("TWITTER_CT0", "")
    return env


def _run(args: list[str], timeout: int = 30) -> dict:
    """Run twitter-cli command and return parsed YAML output."""
    try:
        r = subprocess.run(
            [_TWITTER_BIN] + args + ["--yaml"],
            capture_output=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout,
            env=_env(),
        )
        output = r.stdout or r.stderr or ""
        parsed = yaml.safe_load(output)
        if parsed and isinstance(parsed, dict):
            return parsed
        return {"ok": False, "error": f"Unexpected output: {output[:500]}"}
    except subprocess.TimeoutExpired:
        return {"ok": False, "error": f"twitter-cli timed out after {timeout}s"}
    except FileNotFoundError:
        return {"ok": False, "error": "twitter-cli not installed. Run: uv tool install twitter-cli"}
    except Exception as e:
        return {"ok": False, "error": str(e)}


@mcp.tool()
def twitter_search(
    query: str,
    count: int = 10,
    from_user: str = "",
    lang: str = "",
    tab: str = "Top",
) -> str:
    """
    Search Twitter/X for tweets matching a query.

    Use this for:
    - Monitoring what people say about a company, product, or person
    - Finding industry discussions and trending opinions
    - Tracking competitor announcements and public sentiment
    - Discovering thought leaders in a specific topic

    Args:
        query:     Search keywords (e.g. "amazon FBA tools", "supply chain AI")
        count:     Number of tweets to return (default 10, max ~50)
        from_user: Filter tweets from a specific user (optional, e.g. "elonmusk")
        lang:      Language filter (optional, e.g. "en", "zh")
        tab:       Search tab — "Top" (default), "Latest", "Photos", "Videos"
    """
    args = ["search", query, "-n", str(count), "--tab", tab]
    if from_user:
        args += ["--from", from_user]
    if lang:
        args += ["--lang", lang]

    result = _run(args)
    if not result.get("ok", False):
        return json.dumps(result, ensure_ascii=False, indent=2)

    tweets = result.get("data", [])
    clean = []
    for t in tweets:
        if not isinstance(t, dict):
            continue
        author = t.get("author", {}) or {}
        metrics = t.get("metrics", {}) or {}
        clean.append({
            "id": t.get("id"),
            "text": t.get("text", ""),
            "author": author.get("name", ""),
            "handle": author.get("screenName", ""),
            "verified": author.get("verified", False),
            "likes": metrics.get("likes", 0),
            "retweets": metrics.get("retweets", 0),
            "replies": metrics.get("replies", 0),
            "views": metrics.get("views", 0),
            "date": t.get("createdAtISO", ""),
            "urls": t.get("urls", []),
        })

    return json.dumps({
        "query": query,
        "count": len(clean),
        "tweets": clean,
    }, ensure_ascii=False, indent=2)


@mcp.tool()
def twitter_read_tweet(tweet_id: str) -> str:
    """
    Read a specific tweet and its reply thread.

    Args:
        tweet_id: The tweet ID (numeric string, e.g. "1962980107485622355")
    """
    result = _run(["tweet", tweet_id], timeout=15)
    return json.dumps(result, ensure_ascii=False, indent=2)


@mcp.tool()
def twitter_user_profile(handle: str) -> str:
    """
    Get a Twitter user's public profile information.

    Use this for:
    - Quick background check on a person or company's Twitter presence
    - Checking follower count, bio, and account age
    - Verifying if an account is real vs recently created

    Args:
        handle: Twitter handle without @ (e.g. "ajassy", "elonmusk")
    """
    result = _run(["user", handle], timeout=15)
    return json.dumps(result, ensure_ascii=False, indent=2)


@mcp.tool()
def twitter_user_posts(handle: str, count: int = 10) -> str:
    """
    Get a user's recent tweets. Useful for understanding their public focus areas.

    Args:
        handle: Twitter handle without @ (e.g. "ajassy")
        count:  Number of tweets to fetch (default 10)
    """
    result = _run(["user-posts", handle, "-n", str(count)])
    if not result.get("ok", False):
        return json.dumps(result, ensure_ascii=False, indent=2)

    tweets = result.get("data", [])
    clean = []
    for t in tweets:
        if not isinstance(t, dict):
            continue
        metrics = t.get("metrics", {}) or {}
        clean.append({
            "id": t.get("id"),
            "text": t.get("text", ""),
            "likes": metrics.get("likes", 0),
            "retweets": metrics.get("retweets", 0),
            "views": metrics.get("views", 0),
            "date": t.get("createdAtISO", ""),
        })

    return json.dumps({
        "handle": handle,
        "count": len(clean),
        "tweets": clean,
    }, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    mcp.run()
