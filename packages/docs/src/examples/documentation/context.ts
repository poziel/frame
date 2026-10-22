import type {InjectionKey} from 'vue';
import type {DocumentationTab} from './types';
export const documentationTabKey:InjectionKey<()=>DocumentationTab>=Symbol('documentation-tab');
