import {computed, markRaw, shallowReactive, ref, type Ref} from 'vue';

import type {AIChatController} from './aiChat';

/** In-memory conversation metadata retaining one history-owned chat controller. */
export interface AIChatConversation {

  /** Unique identity within this history store. */
  id: string;

  /** User-visible name preserved while the conversation is retained. */
  title: string;

  /** Application scope identity, independent of the native provider session. */
  applicationId?: string;

  /** Creation time in epoch milliseconds. */
  createdAt: number;

  /** Whether the conversation sorts before unpinned entries. */
  pinned: boolean;

  /** Whether the conversation is retained outside the normal visible list. */
  archived: boolean;

  /** Owned chat controller disposed when the conversation is removed. */
  chat: AIChatController;
}

/** Explicit chat factory and discovery scope for an initially empty history. */
export interface AIChatHistoryOptions {

  /** Creates a new owned controller only when create() is explicitly called. */
  createChat: () => AIChatController;

  /** Application scope identity, independent of the native provider session. */
  applicationId?: string;

  /** Initial application-only or all-in-memory-conversations filter. */
  scope?: 'application' | 'all';
}

/**
 * Owns lazy in-memory conversation creation, selection, and chat disposal.
 * Scope changes only filter conversations already in this store. Persistence
 * and provider-session discovery remain application responsibilities.
 */
export class ChatHistoryController {

  /** Explicit factory and application identity supplied by the host. */
  private readonly options: AIChatHistoryOptions;

  /** Reactive metadata and owned chat references in newest-first order. */
  private readonly entries = shallowReactive<AIChatConversation[]>([]);

  /** Selected conversation identity, independent of the visible list. */
  private readonly selectedId = ref<string>();

  /** Active application or all-conversations filter. */
  private readonly scopeSource: Ref<'application' | 'all'>;

  /** Rejects lifecycle operations after owned chats have been released. */
  private disposed = false;

  /** Cached conversations permitted by the current application scope. */
  private readonly scoped = computed(() =>
    this.entries.filter(
      (item) =>
        this.scopeSource.value === 'all' ||
        item.applicationId === this.options.applicationId
    )
  );

  /** Unarchived conversations, with pinned entries ordered first. */
  readonly visible = computed(() =>
    this.scoped.value
      .filter((item) => !item.archived)
      .sort((a, b) => Number(b.pinned) - Number(a.pinned))
  );

  /** Archived conversations retained in the current scope. */
  readonly archived = computed(() =>
    this.scoped.value.filter((item) => item.archived)
  );

  /** Selected conversation in scope, including its retained chat state. */
  readonly active = computed(() =>
    this.scoped.value.find((item) => item.id === this.selectedId.value)
  );

  /** Snapshot of metadata entries; each entry retains its chat controller identity. */
  readonly conversations = computed(() => this.entries.slice());

  /** Readonly reactive identity of the selected conversation. */
  readonly activeId = computed(() => this.selectedId.value);

  /** Readonly reactive filter controlled through setScope. */
  readonly scope = computed(() => this.scopeSource.value);

  /** Creates an empty store without creating a chat or starting a request. */
  constructor(options: AIChatHistoryOptions) {
    this.options = options;
    if (this.options.scope !== 'all' && !this.options.applicationId)
      throw new Error('Application history requires an applicationId');
    this.scopeSource = ref(this.options.scope ?? 'application');
    this.create = this.create.bind(this);
    this.select = this.select.bind(this);
    this.rename = this.rename.bind(this);
    this.pin = this.pin.bind(this);
    this.archive = this.archive.bind(this);
    this.remove = this.remove.bind(this);
    this.setScope = this.setScope.bind(this);
    this.dispose = this.dispose.bind(this);
  }

  /** Creates and owns a chat only on explicit request, then selects its conversation. */
  create(
    title = 'New conversation',
    applicationId = this.options.applicationId
  ) {
    if (this.disposed) throw new Error('AI chat history is disposed');
    const conversation = shallowReactive({
      id: `conversation-${crypto.randomUUID()}`,
      title,
      applicationId,
      createdAt: Date.now(),
      pinned: false,
      archived: false,
      chat: markRaw(this.options.createChat()),
    });
    this.entries.unshift(conversation);
    this.selectedId.value = conversation.id;
    return conversation;
  }

  /** Selects an existing in-scope conversation without replacing its controller. */
  select(id: string) {
    if (this.disposed || !this.scoped.value.some((item) => item.id === id))
      return false;
    this.selectedId.value = id;
    return true;
  }

  /** Updates a conversation title after trimming and validating it. */
  rename(id: string, title: string) {
    const item = this.entries.find((item) => item.id === id);
    if (!item || this.disposed || !title.trim()) return false;
    item.title = title.trim();
    return true;
  }

  /** Changes history ordering without replacing the conversation or chat. */
  pin(id: string, value = true) {
    const item = this.entries.find((item) => item.id === id);
    if (!item || this.disposed) return false;
    item.pinned = value;
    return true;
  }

  /** Changes archive status and clears selection when archiving the active conversation. */
  archive(id: string, value = true) {
    const item = this.entries.find((item) => item.id === id);
    if (!item || this.disposed) return false;
    item.archived = value;
    if (value && this.selectedId.value === id)
      this.selectedId.value = undefined;
    return true;
  }

  /** Removes one conversation and disposes its owned chat. */
  remove(id: string) {
    const index = this.entries.findIndex((item) => item.id === id);
    if (index < 0 || this.disposed) return false;
    this.entries.splice(index, 1)[0]!.chat.dispose();
    if (this.selectedId.value === id) this.selectedId.value = undefined;
    return true;
  }

  /** Changes discovery scope without fetching external provider conversations. */
  setScope(value: 'application' | 'all') {
    if (this.disposed) return;
    if (value === 'application' && !this.options.applicationId)
      throw new Error('Application history requires an applicationId');
    this.scopeSource.value = value;
    if (!this.active.value) this.selectedId.value = undefined;
  }

  /** Disposes every owned chat exactly once and empties history. */
  dispose() {
    if (this.disposed) return;
    this.entries.forEach((item) => item.chat.dispose());
    this.entries.splice(0);
    this.selectedId.value = undefined;
    this.disposed = true;
  }
}

/** Structural history API used by existing components and host factories. */
export type AIChatHistoryController = Pick<
  ChatHistoryController,
  keyof ChatHistoryController
>;

/** Creates a class-backed history store through the existing public factory. */
export function createAIChatHistory(
  options: AIChatHistoryOptions
): AIChatHistoryController {
  return new ChatHistoryController(options);
}
