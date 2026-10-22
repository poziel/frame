import { serializeUsage } from './demoState';
import { formGuides } from './formGuides';
import { dateGuides } from './dateGuides';
import { colorGuides } from './colorGuides';
import type { ComponentContract, FeatureExample } from './types';
export const componentGuides = { ...formGuides, ...dateGuides, ...colorGuides };
export function formFeatures(id:string, contract:ComponentContract):FeatureExample[]|undefined {
 const guide=componentGuides[id];
 return guide?.examples.map(example=>{
  for(const name of Object.keys(example.values)) {
   if(!contract.props.some(property=>property.name===name))throw Error(`${id}/${example.id} uses unsupported prop ${name}`);
  }
  return {...example, slots:example.slots??{}, variant:example.id, code:serializeUsage(contract,example.values,example.slots??{})};
 });
}
