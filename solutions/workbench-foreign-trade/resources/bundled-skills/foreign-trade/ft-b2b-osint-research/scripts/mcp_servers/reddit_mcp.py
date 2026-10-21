"""
Reddit MCP Server
Wraps rdt-cli (public-clis/rdt-cli) for Reddit OSINT.
No login required for search and reading.

Tools:
  reddit_search     — search Reddit posts by keyword
  reddit_read_post  — read a specific post with comments
  reddit_subreddit  — browse a subreddit's recent posts
  reddit_user_posts — get a user's post history
"""

import json
import os
import subprocess
import yaml
from fastmcp import FastMCP

mcp = FastMCP(
    "reddit",
    instructions=(
        "Reddit OSINT tool. "
        "reddit_search: find Reddit discussions by keyword, optionally within a subreddit. "
        "reddit_read_post: read a post's full text and top comments. "
        "reddit_subreddit: browse recent posts in a subreddit. "
        "reddit_user_posts: see what a Reddit user has been posting about."
    ),
)

_RDT_BIN = "rdt"


def _run(args: list[str], timeout: int = 30) -> dict:
    """Run rdt-cli command and return parsed YAML output."""
    env = os.environ.copy()
    env["OUTPUT"] = "yaml"
    try:
        r = subprocess.run(
            [_RDT_BIN] + args + ["--yaml"],
            capture_output=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout,
            env=env,
        )
        output = r.stdout or r.stderr or ""
        parsed = yaml.safe_load(output)
        if parsed and isinstance(parsed, dict):
            return parsed
        return {"ok": False, "error": f"Unexpected output: {output[:500]}"}
    except subprocess.TimeoutExpired:
        return {"ok": False, "error": f"rdt-cli timed out after {timeout}s"}
    except FileNotFoundError:
        return {"ok": False, "error": "rdt-cli not installed. Run: uv tool install rdt-cli"}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def _extract_posts(result: dict) -> list[dict]:
    """Extract and clean post data from rdt-cli output."""
    data = result.get("data", {})
    if isinstance(data, dict):
        children = data.get("data", {}).get("children", [])
    elif isinstance(data, list):
        children = data
    else:
        return []

    posts = []
    for child in children:
        if isinstance(child, dict) and "data" in child:
            p = child["data"]
        elif isinstance(child, dict):
            p = child
        else:
            continue

        posts.append({
            "id": p.get("id", ""),
            "title": p.get("title", ""),
            "selftext": (p.get("selftext", "") or "")[:500],
            "author": p.get("author", ""),
            "subreddit": p.get("subreddit_name_prefixed", p.get("subreddit", "")),
            "score": p.get("score", p.get("ups", 0)),
            "comments": p.get("num_comments", 0),
            "url": p.get("url", ""),
            "permalink": f"https://reddit.com{p['permalink']}" if p.get("permalink") else "",
            "created": p.get("created_utc", ""),
        })
    return posts


@mcp.tool()
def reddit_search(
    query: str,
    subreddit: str = "",
    count: int = 10,
    sort: str = "relevance",
) -> str:
    """
    Search Reddit for posts matching a query. No login required.

    Use this for:
    - Finding real user opinions about products, companies, or tools
    - Competitive intelligence from user discussions
    - Pain point discovery and market sentiment
    - Identifying common complaints or praise patterns

    Args:
        query:     Search keywords (e.g. "best amazon seller tools 2026")
        subreddit: Search within a specific subreddit (optional, e.g. "FulfillmentByAmazon")
        count:     Number of posts to return (default 10)
        sort:      Sort order — "relevance" (default), "hot", "top", "new", "comments"
    """
    args = ["search", query, "-n", str(count), "--sort", sort]
    if subreddit:
        args += ["-r", subreddit]

    result = _run(args)
    if not result.get("ok", True):
        return json.dumps(result, ensure_ascii=False, indent=2)

    posts = _extract_posts(result)

    return json.dumps({
        "query": query,
        "subreddit": subreddit or "all",
        "count": len(posts),
        "posts": posts,
    }, ensure_ascii=False, indent=2)


@mcp.tool()
def reddit_read_post(post_id: str, expand_comments: bool = False) -> str:
    """
    Read a specific Reddit post with its top comments.

    Args:
        post_id:         Reddit post ID (e.g. "1s8r7sg")
        expand_comments: Load additional "more comments" (slower, default False)
    """
    args = ["read", post_id]
    if expand_comments:
        args.append("--expand-more")

    result = _run(args, timeout=20)
    return json.dumps(result, ensure_ascii=False, indent=2)


@mcp.tool()
def reddit_subreddit(
    name: str,
    count: int = 10,
    sort: str = "hot",
) -> str:
    """
    Browse recent posts in a subreddit.

    Use this for:
    - Understanding what a community is currently discussing
    - Monitoring industry-specific subreddits for trends
    - Finding popular topics and recurring pain points

    Args:
        name:  Subreddit name without r/ (e.g. "FulfillmentByAmazon", "ecommerce")
        count: Number of posts (default 10)
        sort:  Sort — "hot" (default), "new", "top", "rising"
    """
    args = ["sub", name, "-n", str(count), "--sort", sort]
    result = _run(args)
    if not result.get("ok", True):
        return json.dumps(result, ensure_ascii=False, indent=2)

    posts = _extract_posts(result)

    return json.dumps({
        "subreddit": f"r/{name}",
        "sort": sort,
        "count": len(posts),
        "posts": posts,
    }, ensure_ascii=False, indent=2)


@mcp.tool()
def reddit_user_posts(username: str, count: int = 10) -> str:
    """
    Get a Reddit user's recent post history.

    Args:
        username: Reddit username (e.g. "spez")
        count:    Number of posts to fetch (default 10)
    """
    args = ["user-posts", username, "-n", str(count)]
    result = _run(args)
    if not result.get("ok", True):
        return json.dumps(result, ensure_ascii=False, indent=2)

    posts = _extract_posts(result)

    return json.dumps({
        "username": username,
        "count": len(posts),
        "posts": posts,
    }, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    mcp.run()
