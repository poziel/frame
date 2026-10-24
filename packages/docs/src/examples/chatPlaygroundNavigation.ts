import type { Frame } from "@frame/core";
import AIChatPlayground from "./AIChatPlayground.vue";
import type { ChatPlayground } from "./chatPlayground";
import { showWorkspaceContent } from "./workspaceContent";

export function openChatPlayground(frame: Frame, session: ChatPlayground) {
  showWorkspaceContent(frame, {
    label: "AI chat playground",
    component: AIChatPlayground,
    props: { session },
  });
  frame.openSecondaryPanel("demo.secondary.chat");
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}#/playground/ai-chat`,
  );
}
