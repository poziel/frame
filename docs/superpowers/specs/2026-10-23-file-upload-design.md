# File selection controls

Approved direction: two standalone Core controls, FrameFileUpload and FrameFileDropZone. No shell service, backend upload, or Frame dependency. Reuse FrameButton and semantic theme tokens. One combined mode-heavy component was considered; two components make form selection and workspace drop targets easier to compose.

Both controls share accept (native comma-separated MIME/extensions), multiple, maxSize (bytes per file), maxFiles (per selection), disabled, accepted and rejected events. Invalid files are rejected individually with typed reasons; valid files continue. Validation happens after selection/drop, since browsers may hide metadata during dragging.

FileUpload has an optional controlled File[] model, optional removable file list, trigger slot and open/clear/focus methods. Each selection replaces the model. Native input resets after processing so the same file can be selected again. Host owns storage and upload.

FileDropZone keeps default-slot content mounted, has presentation and overlay slots, and appearance='zone'|'overlay'. Overlay mode has no resting decoration, click handler or keyboard interception on content. Zone mode offers a separate browse button. Only file drags activate; nested child transitions must not flicker. Scoped slots expose dragging and open. Escape, drop and drag leaving reset state. Nested zones give the innermost target ownership. Disabled zones do not emit files. No global drop interception.

The controls consume browser File objects. Native runtime drag interception and filesystem paths remain host integration concerns. Forms use the emitted/model files; these controls do not promise native FormData serialization or Reka field registration.
