import { CalendarDate, parseDate, parseDateTime, parseTime, parseZonedDateTime } from '@frame/core';
import type { ApiProperty } from './types';
export const isDateComponent = (name: string) => /^Frame(?:Calendar|RangeCalendar|Date|Time|Month|Year)/.test(name);
export function dateModelKind(name: string, property: string): 'date' | 'time' | undefined {
 return isDateComponent(name) && ['modelValue','defaultValue','placeholder','defaultPlaceholder','minValue','maxValue'].includes(property) ? name.includes('Time') ? 'time' : 'date' : undefined;
}
function parse(value: unknown, time: boolean): unknown {
 if(value === null || value === undefined)return value;
 if(Array.isArray(value))return value.map(item=>parse(item,time));
 if(typeof value==='object' && 'start' in value)return { start: parse((value as {start:unknown}).start,time), end: parse((value as {start:unknown;end?:unknown}).end,time) };
 if(typeof value!=='string')throw Error('Use an ISO date/time string, an array of strings, or a { start, end } range.');
 return time ? parseTime(value) : value.includes('[') ? parseZonedDateTime(value) : value.includes('T') ? parseDateTime(value) : parseDate(value);
}
export function hydrateDemoValue(component:string, property:string, value:unknown) { const kind=dateModelKind(component,property);return kind?parse(value,kind==='time'):value; }
export function serializeDemoValue(value:unknown):unknown {
 if(Array.isArray(value))return value.map(serializeDemoValue);
 if(value&&typeof value==='object') {
  if('start' in value)return {start:serializeDemoValue((value as {start:unknown}).start),end:serializeDemoValue((value as {start:unknown;end?:unknown}).end)};
  if('calendar' in value||'hour' in value)return String(value);
 }
 return value;
}
export function dateExample(name:string, property:string):unknown {
 const time=name.includes('Time'), range=name.includes('Range')&&['modelValue','defaultValue'].includes(property);
 const value=time?'09:30:00':'2026-10-21';
 return range?{start:value,end:time?'17:00:00':'2026-10-26'}:value;
}
export function isCallableProperty(property:ApiProperty) { return /Matcher|ValidateFn|=>|DisplayValue/.test(property.type); }
export { CalendarDate };
