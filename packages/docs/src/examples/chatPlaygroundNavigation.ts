import type { Frame } from "@frame/core";
import ChatPlaygroundPage from "./ChatPlaygroundPage.vue";
import type { ChatPlayground } from "./chatPlayground";
import { showWorkspaceContent } from "./workspaceContent";

export function openChatPlayground(frame: Frame, session: ChatPlayground) {
  showWorkspaceContent(frame, {
    label: "AI chat playground",
    component: ChatPlaygroundPage,
    props: { session },
  });
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}#/playground/ai-chat`,
  );
}
