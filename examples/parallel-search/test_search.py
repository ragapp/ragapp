"""Exercise the example through the MCP SDK and HTTP transport, without a server."""

import asyncio
import contextlib
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import httpx
import search as example

RESULTS = {
    "results": [
        {
            "url": "https://example.org/research",
            "title": "Deployment guidance",
            "publish_date": "2026-01-01",
            "excerpts": ["Keep source provenance for café research."],
        }
    ]
}
ASYNC_CLIENT = httpx.AsyncClient


class MCPPeer:
    def __init__(self, payload=None, error=False, text_only=False, slow=False):
        self.payload = RESULTS if payload is None else payload
        self.error = error
        self.text_only = text_only
        self.slow = slow
        self.requests = []
        self.cancelled = False

    async def handle(self, request):
        message = json.loads(request.content)
        self.requests.append((request, message))
        if message["method"] == "initialize":
            result = {
                "protocolVersion": message["params"]["protocolVersion"],
                "capabilities": {"tools": {}},
                "serverInfo": {"name": "test-search", "version": "1.0"},
            }
        elif message["method"].startswith("notifications/"):
            return httpx.Response(202)
        elif message["method"] == "tools/list":
            result = {
                "tools": [
                    {
                        "name": "web_search",
                        "inputSchema": {
                            "type": "object",
                            "properties": {
                                "objective": {"type": "string"},
                                "search_queries": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                },
                            },
                            "required": ["objective", "search_queries"],
                        },
                    }
                ]
            }
        elif message["method"] == "tools/call":
            if self.slow:
                try:
                    await asyncio.sleep(60)
                except asyncio.CancelledError:
                    self.cancelled = True
                    raise
            result = {
                "content": [{"type": "text", "text": json.dumps(self.payload)}],
                "isError": self.error,
            }
            if not self.text_only:
                result["structuredContent"] = self.payload
        else:
            raise AssertionError(f"Unexpected MCP method: {message['method']}")
        return httpx.Response(
            200, json={"jsonrpc": "2.0", "id": message["id"], "result": result}
        )

    def client(self, **kwargs):
        return ASYNC_CLIENT(transport=httpx.MockTransport(self.handle), **kwargs)


class SearchExampleTests(unittest.TestCase):
    def run_cli(self, peer, directory, *extra):
        output = Path(directory) / "research.txt"
        stdout, stderr = io.StringIO(), io.StringIO()
        with (
            patch.object(example.httpx, "AsyncClient", peer.client),
            patch.dict("os.environ", {"PARALLEL_API_KEY": "unused-test-key"}),
            contextlib.redirect_stdout(stdout),
            contextlib.redirect_stderr(stderr),
        ):
            status = example.main(
                [
                    "Find RAG guidance",
                    "--query",
                    "RAG deployment guidance",
                    "--output",
                    str(output),
                    *extra,
                ]
            )
        return status, output, stderr.getvalue()

    def test_anonymous_request_to_cited_knowledge_file(self):
        peer = MCPPeer()
        with tempfile.TemporaryDirectory() as directory:
            status, output, _ = self.run_cli(peer, directory)
            self.assertEqual(status, 0)
            text = output.read_text(encoding="utf-8")
            for expected in (
                "https://example.org/research",
                "café research",
                "Deployment guidance",
                "2026-01-01",
                "Retrieved at:",
            ):
                self.assertIn(expected, text)
        for request, _ in peer.requests:
            self.assertEqual(str(request.url), example.MCP_URL)
            self.assertEqual(request.method, "POST")
            self.assertEqual(request.headers["user-agent"], example.USER_AGENT)
            self.assertNotIn("authorization", request.headers)
            self.assertNotIn("x-api-key", request.headers)
        calls = [m for _, m in peer.requests if m["method"] == "tools/call"]
        self.assertEqual(len(calls), 1)
        self.assertEqual(
            calls[0]["params"],
            {
                "name": "web_search",
                "arguments": {
                    "objective": "Find RAG guidance",
                    "search_queries": ["RAG deployment guidance"],
                },
            },
        )

    def test_text_json_response(self):
        with tempfile.TemporaryDirectory() as directory:
            status, output, _ = self.run_cli(MCPPeer(text_only=True), directory)
            self.assertEqual(status, 0)
            self.assertIn("https://example.org/research", output.read_text())

    def test_tool_errors_and_invalid_results_do_not_create_files(self):
        cases = [
            MCPPeer({"message": "Usage limit reached; retry later"}, error=True),
            MCPPeer({"results": []}),
            MCPPeer({"unexpected": "response"}),
            MCPPeer({"results": [{"url": "https://example.org"}]}),
        ]
        for peer in cases:
            with self.subTest(payload=peer.payload), tempfile.TemporaryDirectory() as d:
                status, output, error = self.run_cli(peer, d)
                self.assertEqual(status, 1)
                self.assertFalse(output.exists())
                self.assertIn("Could not save research:", error)
                calls = [m for _, m in peer.requests if m["method"] == "tools/call"]
                self.assertEqual(len(calls), 1)

    def test_timeout_cancels_request_and_does_not_create_file(self):
        peer = MCPPeer(slow=True)
        with tempfile.TemporaryDirectory() as directory:
            status, output, error = self.run_cli(peer, directory, "--timeout", "0.1")
            self.assertEqual(status, 1)
            self.assertFalse(output.exists())
            self.assertIn("timed out", error)
            self.assertTrue(peer.cancelled)

    def test_explicit_cancellation_reaches_transport(self):
        peer = MCPPeer(slow=True)

        async def cancel():
            task = asyncio.create_task(example.search("RAG", ["RAG guidance"], 10))
            while not any(m["method"] == "tools/call" for _, m in peer.requests):
                await asyncio.sleep(0)
            task.cancel()
            with self.assertRaises(asyncio.CancelledError):
                await task

        with patch.object(example.httpx, "AsyncClient", peer.client):
            asyncio.run(asyncio.wait_for(cancel(), 2))
        self.assertTrue(peer.cancelled)

    def test_http_failure_does_not_create_file(self):
        peer = MCPPeer()

        async def unavailable(request):
            return httpx.Response(503)

        peer.handle = unavailable
        with tempfile.TemporaryDirectory() as directory:
            status, output, error = self.run_cli(peer, directory)
            self.assertEqual(status, 1)
            self.assertFalse(output.exists())
            self.assertIn("503", error)

    def test_existing_file_is_preserved_before_network_request(self):
        peer = MCPPeer()
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "research.txt"
            output.write_text("Keep this research")
            with self.assertRaises(SystemExit) as stopped:
                self.run_cli(peer, directory)
            self.assertEqual(stopped.exception.code, 2)
            self.assertEqual(output.read_text(), "Keep this research")
            self.assertEqual(peer.requests, [])

    def test_file_created_during_search_is_not_overwritten(self):
        peer = MCPPeer()
        handle = peer.handle
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "research.txt"

            async def race(request):
                response = await handle(request)
                if json.loads(request.content)["method"] == "tools/call":
                    output.write_text("Another writer's research")
                return response

            peer.handle = race
            status, _, _ = self.run_cli(peer, directory)
            self.assertEqual(status, 1)
            self.assertEqual(output.read_text(), "Another writer's research")


if __name__ == "__main__":
    unittest.main()
