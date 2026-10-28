import contracts from './contracts.json';
import themes from './themes.json';
import services from './services.json';
import content from '../../markdown/content.generated.json';
import type {
  ComponentContract,
  ComponentDocumentation,
  FeatureExample,
  ThemeClass,
  ThemeToken,
} from './types';

/** Playground contracts join extracted code facts with Markdown-derived examples. */
const surfaces = contracts.contracts as unknown as Record<
  string,
  ComponentContract
>;
const sources = contracts.pageSources as Record<string, string[]>;
const styling = themes as Record<
  string,
  {classes: ThemeClass[]; tokens: ThemeToken[]}
>;
const serviceContracts = services as unknown as Record<
  string,
  ComponentContract
>;

/** Runtime preview data; documentation prose is authored in the docs tree. */
export const componentDocumentation: Record<string, ComponentDocumentation> =
  Object.fromEntries(
    Object.entries(content).map(([id, page]) => {
      const components = sources[id]!.map((source) => surfaces[source]!);
      if (serviceContracts[id]) components.push(serviceContracts[id]!);
      if (id === 'ai-chat')
        components.push(
          ...['ai-history', 'ai-view']
            .map((key) => serviceContracts[key]!)
            .filter(Boolean)
        );
      return [
        id,
        {
          id,
          components,
          features: page.features as FeatureExample[],
          classes: sources[id]!.flatMap(
            (source) => styling[source]?.classes ?? []
          ),
          tokens: sources[id]!.flatMap(
            (source) => styling[source]?.tokens ?? []
          ),
          demoId: id,
        },
      ];
    })
  );
