export interface Expression {
  parsedText: string;
  vars: number[];
}

export function parse(text: string): Expression {
  let parsedText: string;
  let vars: number[];

  return {
    parsedText: parsedText,
    vars: vars,
  };
}
