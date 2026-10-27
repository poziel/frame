/** URL sources use ordinary browser fetch rules (including CORS). */
export type ViewerSource = File | Blob | string | URL;

/** Renderers supported by the portable viewer. */
export type ViewerKind =
  'image' | 'pdf' | 'video' | 'code' | 'text' | 'unsupported';

/** Host-owned source with optional metadata overrides. */
export interface ViewerFile {

  /** Portable bytes or a browser-fetchable URL; authentication stays host-owned. */
  source: ViewerSource;

  /** Explicit display name; otherwise resolved from File or URL. */
  name?: string;

  /** Explicit MIME type preferred over the supplied Blob or response metadata. */
  mimeType?: string;

  /** Optional syntax language override for code detection. */
  language?: string;
}

/** Conservative renderer selection and source-view capability. */
export interface ViewerType {

  /** Renderer selected for the document. */
  kind: ViewerKind;

  /** Syntax language used by code and SVG source views. */
  language: string;

  /** Whether an image can also display inert XML source. */
  hasSource: boolean;
}
