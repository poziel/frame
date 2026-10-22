# Frame extensions and Reka migration

Status: proposed design for review. No APIs in this document are implemented by this change.
Baseline: 9b75fb1, branch feature/frame-extensions-reka.

## Intent and scope

The application creates a root Frame instance, contributes content and adapters, and controls the visual application through that instance. Frame owns shell composition, installed capabilities, feature instances, shared shell state, presentation, and resource cleanup. The host retains business rules, credentials, data, and backend adapters. FrameShell renders Frame; it is not a separate application controller.

Two UI responsibilities remain distinct: shell regions/services controlled through Frame, and reusable visual controls composed inside host views. A plain button or input must remain usable without a Frame instance.

This design covers a typed extension foundation, an initial Frame-owned chat capability, presentation registration and explicit container placement, and a staged migration of suitable interactions to Reka. It does not implement a unified Vite integration, uploaded-theme loader, persistent conversation storage, or a general third-party plugin marketplace.

## Existing seams

- Core createFrame.ts owns registerView/openView, primary/secondary/bottom registrations, workspace.setPane, commands, layout state, navigation, and dispose.
- registerView already rejects duplicates, creates commands, supports movement, and returns an unregister function. openView reveals the view in its current region and expands its ancestors. Reuse these behaviors.
- FrameShell receives/provides Frame and parks/teleports registered view content to retain identity. Shell unmount removes shell bindings without disposing the root. Preserve feature controllers across remount; the creator explicitly disposes Frame.
- Features createAIChat already creates isolated controllers, accepts ChatOptions.respond, preserves streaming part order, and exposes dispose: stop. AIChat takes a controller; it must not become the controller owner merely by rendering it.
- createTerminalView already adapts a standalone Features controller into a Core view. It is a precedent for presentation adapters, not a second feature registry to copy.
- Core overlays.ts defines shell-aware bounds and portal targets. Reka integration must preserve those boundaries.

## Options considered

1. A typed, per-instance extension that exposes capabilities under Frame.features. Recommended: matches the intended single root API and can reuse current controllers.
2. A separate services object passed beside Frame. Less change initially, but forces hosts to coordinate multiple owners and duplicate cleanup.
3. A global registry or TypeScript module augmentation. Convenient imports, but exposes unavailable capabilities to unrelated instances and makes isolation difficult. Rejected.

## Proposed consumer API

Package naming: the optional package is now @frame/features under packages/features. The rename is implemented separately from the APIs below, which remain proposals.

```ts
import { createFrame } from '@frame/core';
import { chatFeature } from '@frame/features/chat';

// Configure once. ChatFeature is a typed object with behavior, not JSON data.
export const frame = createFrame()
  .use(chatFeature);

// As additional feature implementations become available:
// createFrame().use(chatFeature).use(terminalFeature);

// Later: no feature implementation import is needed at this call site.
const chat = frame.features.chat.create({
  id: 'project-assistant',
  respond: new ProjectResponder(),
});

// Creation and presentation are separate. This creates a view definition only.
const view = chat.createView({ id: 'assistant-view', label: 'Assistant' });
frame.views.secondarySidebar.register(view);
frame.views.open(view.id);

// Arbitrary host components use the same container registration mechanism.
frame.views.panel.register(new FrameView({
  id: 'project-output', label: 'Output', component: ProjectOutput,
}));
```

chatFeature, feature subpath exports, FrameView and these namespaced methods must be implemented before this example can run. Class constructors express behavior and typed contracts; object literals express configuration and are not serialized JSON. A responder object implements a proposed ChatResponseProvider interface with respond(request, writer). Preserve the existing callable ChatResponder type and allow either a function or a provider in the respond option, normalizing invocation without losing the provider's this binding. Do not require inheritance from a particular application responder base class.

The .use() method accepts one self-describing feature descriptor and can be chained. The application does not supply a name or key. The descriptor declares its own literal capability key (for example, ChatFeature declares 'chat'); installation exposes the capability under frame.features.chat. Core's generic type derives the installed capability from that literal key and the descriptor's capability type; it does not declare chat, terminal, or any other package-specific property. With only chat installed, terminal access must be a compile-time error. Return the same runtime Frame with a refined static type; callers retain that returned reference. The existing standalone createAIChat, AIChat, createTerminal and other exports remain usable.

The first lifecycle adapter exports chatFeature. terminalFeature and other descriptors are added after their controller ownership contracts are designed and verified; do not export placeholder implementations. Each feature is explicitly imported during setup; no default installation of the entire package. Focused subpaths and lazy component imports must be verified in built consumers so installing chat does not pull Monaco or terminal backends into the initial bundle.

## Views and container naming

Use primary sidebar, secondary sidebar, and bottom panel in UI/documentation. Primary and secondary describe their roles independently of left/right position. Avoid navigation/inspector as universal names because either region may contain arbitrary application content.

Proposed container APIs are frame.views.primarySidebar.register(view), frame.views.secondarySidebar.register(view), and frame.views.panel.register(view). The panel namespace means the existing bottom-panel region; primary/secondary bottom alignment does not create another view registry. frame.views.open(id) reveals the view in its current region after movement. Registration returns an idempotent unregister function, as it does today. Container objects may later expose availability/visibility methods using the same root shell state, not duplicate stores.

FrameView is a typed definition class for arbitrary components, their props, identity, icon, and actions. Feature instance createView() methods return compatible definitions with their own required props bound. Registering a definition reserves its presentation and makes it available; explicit open controls visibility. Creating a chat creates its controller/state, not a Vue component or a sidebar. Its UI can be mounted directly inside an existing workspace component or registered as a managed view. Multiple views may display one controller without becoming its owner.

Two existing names require an explicit migration: frame.features currently holds settings/notifications/navigation booleans, and frame.views currently is a computed list. Move shell flags under frame.shell.features, preserving createFrame's existing top-level option inputs initially. Replace list reads with frame.views.list(), and replace internal flags reads with the single shell state source. These are breaking public changes; update all consumers, tests, and migration documentation in one dedicated implementation step. Do not maintain competing flags/list stores or silently shadow existing members. The package rename does not perform this API change.

## Extension contract

Core exports a generic FrameExtension<Key, Capability> contract that definitions such as chatFeature implement. Required members are a stable readonly id, a readonly literal key, and a synchronous install(context) operation returning the capability controller and optional cleanup. The key determines the property inside frame.features; id identifies the extension for diagnostics and duplicate detection. An optional displayName provides human-readable diagnostics. Do not add dependency solvers, version negotiation, or other metadata without a demonstrated need. Cleanup may return a promise. Descriptors are reusable across Frames; install allocates all mutable instance state.

Proposed contract sketch (not current exports):

```ts
interface FrameExtension<Key extends string, Capability> {
  readonly id: string;
  readonly key: Key;
  readonly displayName?: string;
  install(context: FrameExtensionContext): {
    capability: Capability;
    dispose?: () => void | Promise<void>;
  };
}

// chatFeature satisfies FrameExtension<'chat', ChatCapability>.
// Its key is the literal 'chat'; install() allocates per-Frame capability state.
```

Exported constant descriptors satisfy this contract; callers do not need to construct ChatFeature or TerminalFeature objects. A specialized feature model can share instance and optional view-factory behavior inside the feature package. The caller passes the instance/descriptor to .use(), not the class constructor. The feature decides its public key; callers do not rename it. Multiple conversations are created through the installed chat capability instead of installing chat repeatedly under aliases.

Core validates the descriptor id and key before calling install. Duplicate ids or keys in the installed feature namespace throw a descriptive error with no side effects; feature keys do not collide with root shell flags because they live in separate namespaces. Returned capabilities must satisfy their declared descriptor types. Capability properties are readonly after attachment; reject duplicate keys and reserved object keys such as __proto__ and constructor.

The extension context supplies the base Frame API, a per-installation lifetime scope, and generic presentation registration/resolution. The scope owns resources through an own(disposer) function. Register cleanup as resources are acquired; if install throws or returns an invalid installation result, Core unwinds the scope in reverse order and exposes no partial capability. Each .use() call is an installation transaction. A failed installation unwinds its own scope without undoing earlier successful calls in the chain. If the caller retains the earlier Frame reference, its previously installed features remain usable; it can explicitly dispose the Frame to abandon the whole setup. Public registrations must be immediately paired with their returned unregister functions.

Installation stays synchronous so frame.features.chat is immediately available and can be inferred from the returned Frame type. Asynchronous work belongs to explicit feature operations. Core must not import Features types, components, or implementation. No dynamic module loading, dependency solver, or hot uninstall in the first version. Dependencies between extensions are explicit installer composition.

Typing is generic and instance-local: use(feature) returns the same Frame with its installed feature map extended by the descriptor's literal key and capability type. Preserve literal keys through descriptor factories; a widened string key must not make arbitrary feature names appear available. No global module augmentation. Compile-time checks reject known collisions; runtime checks remain authoritative for JavaScript consumers. Injected useFrame() remains base-typed; export a capability token and a typed lookup helper for extension-aware components. Missing capability lookup throws an explanatory error without installing anything. Explicitly passing the refined Frame remains supported.

## Ownership and disposal

Frame owns installed scopes and controllers created through their capabilities. Standalone caller-created controllers remain caller-owned. The first factory does not adopt arbitrary externally supplied controllers, avoiding implicit ownership transfer.

Disposal first marks Frame unavailable and blocks new installs, feature creation, opening, and presentation registration. It immediately cancels work and starts extension cleanup while existing view registries are still available, then clears Core registrations. Extension scopes unwind in reverse install order; every disposer is attempted even if another fails. Dispose is idempotent.

Preserve the current synchronous core cleanup behavior. Add whenDisposed(): Promise<void> to await asynchronous resource release. dispose() starts cleanup and remains callable by existing synchronous owners. Cleanup failures are collected and surfaced through the completion promise; internally observe rejection so legacy callers do not cause unhandled promise rejections. Tests must prove all resources are attempted and errors remain observable to callers awaiting completion.

FrameShell mounting alone must not duplicate installation or feature creation. Preserve current shell ownership behavior for compatibility after inspecting its existing unmount cleanup; explicitly document which scope owns the Frame instance. Multiple renderers for one instance are not added in this version. Independent Frame instances must remain isolated, including their overlay targets and presentation registries.

## Chat capability

frame.features.chat exposes create(options), get(id), list(), and dispose(id). IDs are unique within a Frame; duplicates and unknown disposal requests throw descriptive errors. get returns undefined for a missing id. list returns a readonly snapshot. Each chat has its own responder and state, reusing createAIChat. dispose aborts active work, ignores stale callbacks, unregisters owned presentations, and removes the instance. Its createView() method supplies a Frame-compatible view definition without placing or opening it.

Frame owns controllers created through the capability. A view owns its presentation bindings, not the controller. Closing/hiding/unregistering a view does not delete its chat. Disposing the controller removes or invalidates all views backed by it. The policy for externally mounted content is to unregister its presentation and render a disposed state without silently creating another controller.

## Presentation registration

Core provides a generic presentation registry keyed by feature descriptor id and instance id. Managed view registration reserves a presentation before mounting. Mounting attaches focus bindings; unmounting detaches them. Only owner unregistration removes a reservation, so a hidden or not-yet-rendered view is not treated as missing.

Feature-created views bind the controller plus reveal/focus/hide behavior through the container. Opening uses the existing openView path and respects the current region after moves. Direct workspace embedding keeps the standalone AIChat :chat pattern; an optional managed FrameChat wrapper can resolve a Frame-owned instance and supply presentation context. Arbitrary DOM presence is not a reliable registration signal.

There is no automatic sidebar on chat creation or ordinary view registration. The earlier automatic fallback proposal is superseded by explicit placement. Defer a convenience operation that chooses/reuses a presentation until requested. This keeps the documentation chat's embedded workflow and terminal's explicit view workflow equally supported. A generic view-open request for an unknown view errors instead of manufacturing UI.

Container availability, visibility, close versus disposal, and lifecycle cleanup use Frame-owned state. Opening a hidden registered view reveals it; an unavailable region cannot be bypassed. Reserve view ids synchronously so repeated/concurrent registration cannot create duplicates. Opening before a mounted shell must have a documented deterministic result; the initial proposal is a descriptive error, with registration allowed before mount.

## Root shell control

Keep existing methods usable while introducing consistent control incrementally. Add a focused shell controller rather than moving everything into createFrame.ts. It normalizes typed configuration for region availability and initial visibility, and provides runtime setters shared by UI commands and API calls. Availability restrictions apply to generated commands, registration, opening, and movement.

Do not replace the current workspace tree, view registry, navigation state, or layout calculations. The initial implementation needs region availability, active-shell lifecycle, and presentation context, plus the explicit features/views namespace migration described above. Unifying every existing FrameShell prop into root configuration is follow-up work; document remaining props until migrated. A migration must not create parallel mutable state for the same setting.

## Reka migration principles

Frame's public components remain the integration boundary. Reka owns suitable interaction mechanics; Frame owns props/events, semantic commands, visual tokens, geometry, view placement, and lifetime. Applications should not need to import Reka to use a Frame component.

Do not replace every Vue component mechanically. Native buttons, text inputs, text areas, icons, loaders, and workbench geometry remain native/custom unless a missing interaction requires a primitive. Domain features such as chat, editor, terminal, dragging, and persistence are not Reka responsibilities.

| Component area | Proposed primitive | Migration conditions |
| --- | --- | --- |
| FrameCheckbox | Checkbox | First bounded adapter; preserve boolean model, label, disabled, attrs, and native form behavior |
| FrameSlider | Slider | Preserve numeric API, keyboard increments, range limits, disabled and form behavior |
| FrameSelect | Select | Preserve string values, separators, details/default hints, empty-value behavior, typeahead, focus return, and shell bounds |
| FrameTooltip | Tooltip | Preserve timing, shortcut content, placement, disabled behavior and portal target; scope provider per shell with standalone fallback |
| FrameMenu / ContextMenu / MenuBar | DropdownMenu / ContextMenu / Menubar | Shared item contract, check states, disabled entries, nested flyouts, keyboard behavior and commands remain Frame-owned |
| FrameModal / QuickInput | Dialog where appropriate | Keep draggable/resizable geometry, topmost behavior, nested overlays, focus restoration and shell-specific shortcuts |
| Tabs / panel actions | Tabs / Toolbar only where semantics fit | Do not reinterpret draggable view registrations as a local tab-state owner |
| Custom scrollbars / splitters | Retain initially | Evaluate separately; current shell-aware geometry and scrolling require behavior evidence before replacement |
| Color picker | Retain initially | Do not introduce an alpha primitive without a separate compatibility decision |

Reka portalled content must use Frame's overlay target. Collision boundaries must be tested with an embedded shell, not only the full viewport. Exactly one mechanism owns positioning and focus for each migrated popup; avoid running legacy listeners and Reka handlers together. Preserve standalone viewport behavior and shared runtime theme inheritance.

Audit unlayered component styles and actual rendered structure before changing markup: existing native input selectors will not automatically style a Reka button. Preserve class-based consumer hooks where practical, but make semantic browser assertions instead of freezing internal markup.

Special compatibility gates: Select empty string semantics, disabled option navigation, checked versus highlighted state, nested-menu selection, Dialog outside interaction and scroll locking inside an embedded shell, overlay scrollbar clicks, quick reopens, and stationary-pointer behavior. If a primitive cannot preserve a required interaction, retain the current implementation until an explicit behavior decision is approved.

## Delivery sequence and acceptance

1. Core extension scopes, typed attachment, disposal completion, and configuration/region availability foundation. No Reka replacements in this change.
2. Chat capability wrapping the existing controller, typed view factories, managed presentation adapters, and both embedded/sidebar docs demonstrations. Validate the architecture through a real consumer.
3. Checkbox adapter, then Slider. Each is independently reviewable with standalone and shell examples.
4. Select and Tooltip, after proving the overlay adapter and portal behavior.
5. Menus, dialogs, and QuickInput in separate changes. Retain Frame-specific geometry and services. Evaluate remaining categories rather than requiring every component to use Reka.

Each stage must preserve the current public exports unless an explicit breaking migration is documented. Test types against packaged public exports as well as source behavior. Docs demonstrates consumption; no extension implementation or backend belongs in Docs.

Required extension checks: two Frames with different capabilities/responders, duplicate ids and keys, chained installation inference, descriptor reuse across Frames, failed-install rollback preserving earlier installations, per-feature state isolation, lazy startup, disposal during active generation, stale callbacks, repeated disposal, async cleanup failures, and compile-time capability presence/absence.

Required presentation checks: pre-mount registration, hidden and moved views, multiple registered presentations, repeated opens, no duplicate commands, missing shell, disabled region, close/unregister versus controller disposal, remount, keyboard focus, and nested shell portal isolation.

Required Reka checks: existing component models/events, native forms and disabled states, full keyboard operation, labels/ARIA, portal containment, shell boundary clipping, nested menus/modals, theme changes and visual comparisons at desktop and narrow widths. Run relevant existing browser suites and add tests for changed behavior rather than duplicating implementation assertions.

Commands: bun test; build Core, then Features; check:consumer; build Docs. Tailwind remains separately verified with check:tailwind and its browser fixture. Native terminal changes require native validation when introduced; this design makes no native implementation changes.

## References and review

Repository guidance: AGENTS.md, docs/architecture.md, docs/package-boundaries.md, docs/theme-variables.md.
Reka documentation consulted for the design:
- https://reka-ui.com/docs/components/select
- https://reka-ui.com/docs/components/dialog
- https://reka-ui.com/docs/components/tooltip
- https://code.visualstudio.com/docs/editing/getting-started/userinterface (primary/secondary sidebar and panel terminology)

Review assumptions: explicit container placement replaces automatic fallback; opening requires a mounted shell; primary/secondary sidebar names remain role-based; and automatic styling/build setup is outside this runtime design. These are concrete proposals for review, not previous user requirements.
