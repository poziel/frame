import type { ChatPart } from "./aiChat";

/** Presentation groups retain the first ID so an open accordion survives streamed updates. */
export function groupChatParts(parts: readonly ChatPart[]): ChatPart[] {
  const groups: ChatPart[] = [];
  for (const part of parts) {
    const previous = groups[groups.length - 1];
    if (!previous || previous.type !== part.type) { groups.push({ ...part }); continue; }
    previous.text = [previous.text, part.text].filter(Boolean).join("\n\n");
    if (previous.type === "thinking" && part.type === "thinking") {
      previous.startedAt = Math.min(previous.startedAt, part.startedAt);
      previous.finishedAt = previous.finishedAt !== undefined && part.finishedAt !== undefined
        ? Math.max(previous.finishedAt, part.finishedAt) : undefined;
    }
  }
  return groups;
}
