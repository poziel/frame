import generatedTypes from '../markdown/types.generated.json';

/** Markdown-derived API summary used by the searchable reference catalog. */
export interface TypeDocumentation {

  /** Introductory explanation from the canonical article. */
  description: string;

  /** Optional short usage guidance. */
  usage?: string;

  /** Consumer example from the article's first code fence. */
  code: string;

  /** Source-derived or authored member notes for catalog filtering. */
  properties: {
    name: string;
    type: string;
    description: string;
    reference?: string;
  }[];
}

/** Generated from canonical Markdown, never a separately authored narrative. */
export const typeDocs: Record<string, TypeDocumentation> = generatedTypes;
