export type DocumentationTab = 'features' | 'api' | 'theming' | 'demo';
export type DefaultValue = { kind: 'required' } | { kind: 'omitted' } | { kind: 'literal'; value: string } | { kind: 'derived'; expression: string };
export interface ApiProperty { name: string; type: string; default: DefaultValue; description: string; options?: string[]; control: 'boolean' | 'number' | 'text' | 'json' | 'fixture'; references: string[] }
export interface ApiCallable { kind?: 'method' | 'property'; name: string; parameters: string; returns: string; description: string }
export interface ComponentContract { name: string; source: string; sourceHash?: string; props: ApiProperty[]; emits: ApiCallable[]; slots: ApiCallable[]; methods: ApiCallable[]; forwardsAttrs: boolean }
export interface ThemeToken { name: string; value: string; description: string; selector: string; source: string }
export interface ThemeClass { name: string; description: string }
export interface FeatureExample { id: string; title: string; description: string; variant: string; code: string; values?: Record<string, unknown>; slots?: Record<string,string> }
export interface ComponentDocumentation { id: string; components: ComponentContract[]; features: FeatureExample[]; classes: ThemeClass[]; tokens: ThemeToken[]; demoId: string; guide?: import('./formGuides').ComponentGuide }
