import {componentDocumentation} from './registry';
import type {DocumentationOverview, FeatureExample} from './types';

/** Compatibility reading view for tests; examples are authored in Markdown. */
export const aiGuides: Record<
  string,
  {overview: DocumentationOverview; features: FeatureExample[]}
> = Object.fromEntries(
  ['ai-chat', 'ai-view', 'ai-history', 'ai-prompt', 'ai-conversation']
    .filter((id) => !!componentDocumentation[id])
    .map((id) => [
      id,
      {
        overview: {purpose: '', usage: '', notes: []},
        features: componentDocumentation[id]!.features,
      },
    ])
);
