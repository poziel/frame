export const encodeChoiceValue = (value: string): string => `frame:${value}`;
export const decodeChoiceValue = (value: string): string => value.slice(6);
