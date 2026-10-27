import {ref} from 'vue';
import type * as Monaco from 'monaco-editor';
import {CodeBlockTheme} from '../../../index';
import {createCodeEditor, resolveCodeEditorOptions} from './codeEditor';
import type {
  CodeEditorProps,
  CodeEditorController,
} from '../types/codeEditorTypes';
import {prepareCodeEditor} from '../services/monaco/codeEditorRuntime';

/** Events forwarded by the owning Vue surface without changing their payloads. */
export interface EditorSurfaceEvents {

  /** Publishes controlled source changes. */
  emit(event: 'update:modelValue', code: string): void;

  /** Announces a successful initial attachment. */
  emit(event: 'ready', editor: CodeEditorController): void;

  /** Publishes Monaco's source-change metadata. */
  emit(
    event: 'change',
    code: string,
    change: Monaco.editor.IModelContentChangedEvent
  ): void;

  /** Publishes cursor and selection changes. */
  emit(
    event: 'selection',
    change: Monaco.editor.ICursorSelectionChangedEvent
  ): void;

  /** Publishes widget focus changes. */
  emit(event: 'focus' | 'blur'): void;

  /** Reports preparation or attachment failures. */
  emit(event: 'error', cause: unknown): void;
}

/**
 * Owns one mounted editor, model, event subscriptions, and async syntax revision.
 *
 * The component supplies reactive props and the host element. A controller only
 * borrows the instance; this surface releases it and disposes Monaco resources.
 * Late preparation results are ignored after unmount or a newer syntax request.
 */
export class EditorSurface {

  /** Reactive loading state displayed by the component. */
  readonly loading = ref(true);

  /** Current preparation or attachment failure displayed by the component. */
  readonly error = ref('');

  /** Fallback controller used when no host controller is supplied. */
  private readonly internal = createCodeEditor();

  /** Controller currently borrowing the mounted instance. */
  controller: CodeEditorController;

  /** Mounted editor owned by this surface. */
  private editor: Monaco.editor.IStandaloneCodeEditor | undefined;

  /** Text model owned independently from the editor widget. */
  private model: Monaco.editor.ITextModel | undefined;

  /** Runtime selected by the most recent successful preparation. */
  private monaco: typeof Monaco | undefined;

  /** Releases the current controller's borrowed instance. */
  private release: (() => void) | undefined;

  /** Whether async preparation may still update this surface. */
  private alive = false;

  /** Whether the owning component has permanently released this surface. */
  private disposed = false;

  /** Monotonic syntax request identifier used to reject stale results. */
  private revision = 0;

  /** Monaco event subscriptions released before editor disposal. */
  private readonly disposables: Monaco.IDisposable[] = [];

  /** Reactive component inputs read when an operation runs. */
  private readonly props: CodeEditorProps;

  /** Resolves the current DOM host after component mount. */
  private readonly getHost: () => HTMLElement | undefined;

  /** Typed Vue event forwarding supplied by the component. */
  private readonly events: EditorSurfaceEvents;

  /** Records dependencies without loading Monaco or mounting a surface. */
  constructor(
    props: CodeEditorProps,
    getHost: () => HTMLElement | undefined,
    events: EditorSurfaceEvents
  ) {
    this.props = props;
    this.getHost = getHost;
    this.events = events;
    this.controller = props.editor ?? this.internal;
    this.updateOptions = this.updateOptions.bind(this);
    this.syncValue = this.syncValue.bind(this);
    this.syncSyntax = this.syncSyntax.bind(this);
    this.setController = this.setController.bind(this);
    this.mount = this.mount.bind(this);
    this.dispose = this.dispose.bind(this);
  }

  /** Starts initial preparation only after the component has mounted. */
  mount(): void {
    if (this.disposed) return;
    this.alive = true;
    void this.syncSyntax();
  }

  /** Applies syntax changes only while mounted, matching Vue watcher timing. */
  refreshSyntax(): void {
    if (this.alive) void this.syncSyntax();
  }

  /** Claims a new controller before releasing the previous one. */
  setController(value?: CodeEditorController): void {
    const next = value ?? this.internal;
    if (next === this.controller) return;
    try {
      const nextRelease = this.editor ? next.attach(this.editor) : undefined;
      this.release?.();
      this.release = nextRelease;
      this.controller = next;
    } catch (cause) {
      this.fail(cause);
    }
  }

  /** Invalidates async work, releases the controller, and disposes owned resources. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.alive = false;
    this.revision++;
    this.disposables.forEach((item) => item.dispose());
    this.release?.();
    this.editor?.dispose();
    this.model?.dispose();
  }

  /** Applies direct/nested options to both the widget and its model. */
  updateOptions(): void {
    const options = resolveCodeEditorOptions(this.props);
    this.editor?.updateOptions(options);
    this.model?.updateOptions(options);
  }

  /** Reconciles controlled source text through the undo-preserving controller. */
  syncValue(): void {
    if (
      this.editor &&
      this.model &&
      this.props.modelValue !== undefined &&
      this.model.getValue() !== this.props.modelValue
    ) {
      this.controller.replaceCode(this.props.modelValue);
    }
  }

  /** Prepares syntax, then mounts once or updates the existing model in place. */
  private async syncSyntax(): Promise<void> {
    const current = ++this.revision;
    this.loading.value = true;
    this.error.value = '';
    try {
      const prepared = await prepareCodeEditor(
        this.props.language ?? 'plaintext',
        this.props.theme ?? CodeBlockTheme.DarkPlus
      );
      const host = this.getHost();
      if (!this.alive || current !== this.revision || !host) return;
      prepared.activate();
      this.monaco = prepared.monaco;
      if (!this.editor) {
        this.model = this.monaco.editor.createModel(
          this.props.modelValue ?? '',
          prepared.language
        );
        this.editor = this.monaco.editor.create(host, {
          ...resolveCodeEditorOptions(this.props),
          model: this.model,
          theme: prepared.theme,
        });
        this.model.updateOptions(resolveCodeEditorOptions(this.props));
        try {
          this.release = this.controller.attach(this.editor);
        } catch (cause) {
          this.editor.dispose();
          this.model.dispose();
          this.editor = undefined;
          this.model = undefined;
          throw cause;
        }
        this.disposables.push(
          this.editor.onDidChangeModelContent((event) => {
            const code = this.model!.getValue();
            this.events.emit('update:modelValue', code);
            this.events.emit('change', code, event);
          }),
          this.editor.onDidChangeCursorSelection((event) =>
            this.events.emit('selection', event)
          ),
          this.editor.onDidFocusEditorWidget(() => this.events.emit('focus')),
          this.editor.onDidBlurEditorWidget(() => this.events.emit('blur'))
        );
        if (this.props.autofocus) this.editor.focus();
        this.events.emit('ready', this.controller);
      } else {
        this.monaco.editor.setModelLanguage(this.model!, prepared.language);
        this.monaco.editor.setTheme(prepared.theme);
      }
    } catch (cause) {
      if (this.alive && current === this.revision) this.fail(cause);
    } finally {
      if (this.alive && current === this.revision) this.loading.value = false;
    }
  }

  /** Publishes a failure without destroying an already mounted editor. */
  private fail(cause: unknown): void {
    this.error.value = cause instanceof Error ? cause.message : String(cause);
    this.events.emit('error', cause);
  }
}
