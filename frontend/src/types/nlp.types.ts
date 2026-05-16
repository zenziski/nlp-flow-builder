export interface Intent {
  _id: string;
  botId: string;
  name: string;
  examples: string[];
  answers: string[];
  entities: string[];
  language: string;
}

export interface Entity {
  _id: string;
  botId: string;
  name: string;
  type: 'enum' | 'regex' | 'trim';
  values: Array<{ value: string; synonyms: string[] }>;
}

export interface NlpResult {
  intent: string;
  score: number;
  entities: Array<{ entity: string; value: string; sourceText: string }>;
  answer?: string;
  utterance: string;
  language: string;
}
