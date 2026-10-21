"""
Perplexity Search MCP Server
Real-time web search with LLM synthesis via OpenRouter → Perplexity Sonar.
"""

import os
import json
import ssl
import time
import urllib.request
import urllib.error
import certifi
from fastmcp import FastMCP

_SSL_CTX = ssl.create_default_context(cafile=certifi.where())

mcp = FastMCP(
    "perplexity",
    instructions="Real-time web search with AI synthesis. Use for: company news, market trends, recent events, person research, regulatory updates. Returns synthesized answers with source citations."
)

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


def _call_openrouter(model: str, messages: list, max_tokens: int = 2048) -> dict:
    """POST to OpenRouter chat completions endpoint."""
    if not OPENROUTER_API_KEY:
        return {"error": "OPENROUTER_API_KEY not set. Check your .env or mcp.json env config."}

    payload = json.dumps({
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
    }).encode()

    req = urllib.request.Request(
        OPENROUTER_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://osint-agent",
            "X-Title": "OSINT Agent",
        },
        method="POST"
    )

    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60, context=_SSL_CTX) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")[:500]
            if e.code == 401:
                return {"error": f"OpenRouter API key invalid (HTTP 401). Check OPENROUTER_API_KEY."}
            if e.code == 429:
                if attempt < 2:
                    time.sleep(2 ** attempt)
                    continue
                return {"error": "OpenRouter rate limit (HTTP 429). Try again later."}
            if e.code >= 500 and attempt < 2:
                time.sleep(2)
                continue
            return {"error": f"OpenRouter HTTP {e.code}: {body}"}
        except Exception as e:
            if attempt < 2:
                time.sleep(2)
                continue
            return {"error": f"Request failed: {str(e)}"}

    return {"error": "Max retries exceeded"}


def _extract_answer(result: dict) -> str:
    """Pull text content + citations from OpenRouter response."""
    if "error" in result:
        return f"[ERROR] {result['error']}"

    try:
        content = result["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        return f"[ERROR] Unexpected response format: {json.dumps(result)[:300]}"

    # Append citations if present (Perplexity includes them in some responses)
    citations = result.get("citations", [])
    if citations:
        content += "\n\n**来源:**\n" + "\n".join(f"- {c}" for c in citations[:8])

    return content


@mcp.tool()
def perplexity_search(query: str) -> str:
    """
    Quick real-time web search with AI synthesis. Best for: company background,
    recent news, person lookup, regulatory checks. Uses sonar model (~$0.001/query).

    Args:
        query: Search query in natural language (Chinese or English both work)

    Returns:
        Synthesized answer with inline citations
    """
    messages = [
        {
            "role": "system",
            "content": "You are a precise research assistant. Answer in the same language as the query. Be concise, factual, and always cite sources inline."
        },
        {"role": "user", "content": query}
    ]
    result = _call_openrouter("perplexity/sonar", messages, max_tokens=1024)
    return _extract_answer(result)


@mcp.tool()
def perplexity_research(query: str, focus: str = "general") -> str:
    """
    Deep real-time research with sonar-pro. More thorough than perplexity_search.
    Best for: competitive intelligence, market analysis, due diligence, industry reports.
    Uses sonar-pro model (~$0.003/query input + $0.015/1K output tokens).

    Args:
        query: Research question (be specific for better results)
        focus: One of: general | company | market | person | regulatory | news

    Returns:
        Comprehensive synthesized report with citations
    """
    system_prompts = {
        "company": "You are a B2B commercial intelligence analyst. Research the target company thoroughly: business model, financials, leadership, competitive position, recent news, red flags. Be analytical and cite all facts.",
        "market": "You are a market research analyst. Cover market size, growth trends, key players, competitive dynamics, and emerging opportunities. Use data and cite sources.",
        "person": "You are an executive researcher. Find professional background, current role, past companies, public statements, LinkedIn presence, and notable achievements. Professional tone only.",
        "regulatory": "You are a compliance analyst. Research relevant regulations, recent policy changes, enforcement actions, and compliance requirements. Be precise with dates and jurisdictions.",
        "news": "You are a news analyst. Find the most recent and relevant news, developments, and events. Focus on last 6 months. Summarize key themes and implications.",
        "general": "You are a thorough research analyst. Provide comprehensive, well-structured analysis with cited facts. Be specific and actionable."
    }

    system = system_prompts.get(focus, system_prompts["general"])

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": query}
    ]
    result = _call_openrouter("perplexity/sonar-pro", messages, max_tokens=2048)
    return _extract_answer(result)


if __name__ == "__main__":
    mcp.run()
