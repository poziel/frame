import type {
  ChatPart,
  ChatMessage,
  ChatActivityPart,
  ChatThinkingPart,
  ChatArtifactPart,
  ChatActivityGroupPart,
} from '../../types/chatTypes';

/**
 * Copies one part, including mutable question, choice, and answer containers.
 * Other variants contain scalar fields and are copied shallowly. Artifact URLs
 * remain host-owned references; copying neither fetches nor revokes resources.
 */
export function copyChatPart(part: ChatPart): ChatPart {
  if (part.type !== 'question') return {...part};
  return {
    ...part,
    questions: part.questions.map((question) => ({
      ...question,
      choices: question.choices.map((choice) => ({...choice})),
    })),
    answers: part.answers?.map((answer) => ({
      ...answer,
      choiceIds: [...answer.choiceIds],
    })),
  };
}
/**
 * Copies message, part, attachment, and file-list containers for snapshots.
 * File objects retain their original identity; this helper does not duplicate
 * their contents or change the lifetime of host-owned artifacts and files.
 */
export function copyChatMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    ...message,
    parts: message.parts.map(copyChatPart),
    attachments: message.attachments.map((item) => ({
      ...item,
      files: item.files?.slice(),
    })),
  }));
}

/** Presentation groups retain the first ID so an open accordion survives streamed updates. */
export function groupChatParts(parts: readonly ChatPart[]): ChatPart[] {
  const groups: ChatPart[] = [];
  for (const part of parts) {
    const previous = groups[groups.length - 1];
    if (
      !previous ||
      previous.type !== part.type ||
      (part.type !== 'message' && part.type !== 'thinking') ||
      (part.type === 'message' &&
        previous.type === 'message' &&
        (part.phase ?? 'final') !== (previous.phase ?? 'final'))
    ) {
      groups.push(copyChatPart(part));
      continue;
    }
    previous.text = [previous.text, part.text]
      .filter(Boolean)
      .join(part.type === 'thinking' ? '\n' : '\n\n');
    if (previous.type === 'thinking' && part.type === 'thinking') {
      previous.startedAt = Math.min(previous.startedAt, part.startedAt);
      previous.finishedAt =
        previous.finishedAt !== undefined && part.finishedAt !== undefined
          ? Math.max(previous.finishedAt, part.finishedAt)
          : undefined;
    }
  }
  return groups;
}

/** Presentation only: keep original event chronology in the controller for adapters and snapshots. */
export function splitChatTurn(parts: readonly ChatPart[]) {
  const work: ChatPart[] = [],
    answer: ChatPart[] = [];
  for (const part of parts) {
    if (
      part.type === 'artifact' ||
      (part.type === 'message' && part.phase !== 'intermediate')
    )
      answer.push(part);
    else work.push(part);
  }
  return {work: groupChatParts(work), answer: groupChatParts(answer)};
}

/** Presentation-only group retaining the original activity objects and identities. */
export interface ChatActivityGroup {

  /** Distinguishes a grouped presentation row from individual work parts. */
  type: 'activityGroup';

  /** First activity ID keeps an expanded group stable as events and outputs stream. */
  id: string;

  /** Original activities displayed together without changing stored chronology. */
  activities: ChatActivityPart[];

  /** Optional explicit group title; automatic groups may omit it. */
  label?: string;
}

/** Work-timeline rows after separating thoughts, artifacts, and final answers. */
type ChatWorkItem =
  | ChatActivityGroup
  | Exclude<
      ChatPart,
      | ChatThinkingPart
      | ChatActivityPart
      | ChatArtifactPart
      | ChatActivityGroupPart
    >;

/** Thoughts are transient; only adjacent actions share a visual group. No operation is stopped by a group boundary. */
export function buildChatWorkTimeline(parts: readonly ChatPart[]) {
  const items: ChatWorkItem[] = [];
  let group: ChatActivityGroup | undefined;
  let thought: ChatThinkingPart | undefined;
  const namedGroups = new Map<string, ChatActivityGroup>();
  for (const part of parts) {
    if (part.type === 'thinking') {
      thought = part.finishedAt === undefined ? part : undefined;
      continue;
    }
    thought = undefined;
    if (part.type === 'activityGroup') {
      const named: ChatActivityGroup = {
        type: 'activityGroup',
        id: part.id,
        label: part.label,
        activities: [],
      };
      namedGroups.set(part.id, named);
      items.push(named);
      group = undefined;
      continue;
    }
    if (part.type === 'activity') {
      const named = part.groupId ? namedGroups.get(part.groupId) : undefined;
      if (named) {
        named.activities.push(part);
        group = undefined;
        continue;
      }
      if (!group) {
        group = {type: 'activityGroup', id: part.id, activities: []};
        items.push(group);
      }
      group.activities.push(part);
      continue;
    }
    group = undefined;
    if (
      part.type !== 'artifact' &&
      (part.type !== 'message' || part.phase === 'intermediate')
    )
      items.push(part);
  }
  return {items, thought};
}

/** Measures a group from its earliest start, freezing elapsed time once all work ends. */
export function activityGroupTiming(
  activities: readonly ChatActivityPart[],
  now: number
) {
  if (!activities.length) return undefined;
  const running = activities.some((activity) => activity.status === 'running');
  const start = Math.min(...activities.map((activity) => activity.startedAt));
  const end = running
    ? now
    : Math.max(
        ...activities.map(
          (activity) => activity.finishedAt ?? activity.startedAt
        )
      );
  const seconds = Math.max(0, Math.floor((end - start) / 1000));
  return {
    running,
    duration:
      seconds < 60
        ? `${seconds}s`
        : `${Math.floor(seconds / 60)}m ${seconds % 60}s`,
  };
}
