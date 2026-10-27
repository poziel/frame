import { expect, test } from "bun:test";
import { renderChatMarkdown } from "../packages/core/src/modules/chat/services/content/chatMarkdown";
test("assistant Markdown renders tables, emphasis, lists and fenced code", () => {
  const html = renderChatMarkdown("**Result**\n\n| Pixels | Result |\n| --- | --- |\n| 4096 | OK |\n\n- One\n\n```json\n{}\n```");
  expect(html).toContain("<strong>Result</strong>");
  expect(html).toContain("<table>");
  expect(html).toContain("<td>4096</td>");
  expect(html).toContain("<ul>");
  expect(html).toContain('class="language-json"');
});
test("assistant Markdown cannot inject HTML, unsafe links or remote images", () => {
  const html = renderChatMarkdown('<script>alert(1)</script>\n[x](javascript:alert(1))\n![reference](https://example.com/tracker.png)');
  expect(html).not.toContain("<script>");
  expect(html).not.toContain('href="javascript:');
  expect(html).not.toContain("<img");
});
