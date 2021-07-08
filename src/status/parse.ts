const REGEX: RegExp = /{(.*?)}/g;
export interface Expression {
  parsed: string[];
  vars: number[];
}

// Could be done better
export function parse(query: string): Expression {
  let parsed: string[] = [];
  let vars: number[] = [];

  query.split(REGEX).forEach((s) => {
    switch (s) {
      case "word_count":
        vars.push(0);
        break;
      case "character_count":
        vars.push(1);
        break;
      case "sentence_count":
        vars.push(2);
        break;
      case "total_word_count":
        vars.push(3);
        break;
      case "total_character_count":
        vars.push(4);
        break;
      case "total_sentence_count":
        vars.push(5);
        break;
      case "file_count":
        vars.push(6);
        break;
      case "words_today":
        vars.push(7);
        break;
      case "characters_today":
        vars.push(8);
        break;
      case "sentences_today":
        vars.push(9);
        break;

      default:
        parsed.push(s);
        break;
    }
  });

  return {
    parsed: parsed,
    vars: vars,
  };
}

const varNames = {
  word_count: 0,
  charater_count: 1,
  sentence_count: 2,
  total_word_count: 3,
  total_charater_count: 4,
  total_sentence_count: 5,
  file_count: 6,
};
