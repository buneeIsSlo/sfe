export interface Company {
  id: number;
  name: string;
  logo: string;
  alias?: string;
}

export interface RawQuestion {
  id: number;
  title: string;
  permalink: string;
  tags: string;
  likes: number;
  companies: Company[];
  createdAt: number;
  tried?: number;
  accepted?: number;
  isNew?: boolean;
}

export interface PreparedQuestion extends RawQuestion {
  difficulty: "Easy" | "Medium" | "Hard";
  answer: string | null;
  notes: string | null;
  completed: boolean;
  lastUpdated: number | null;
}

export interface Question {
  id: number;
  title: string;
  permalink: string;
  tags: string;
  likes: number;
  companies: Company[];
  createdAt: number;
  difficulty: "Easy" | "Medium" | "Hard";
  answer: string | null;
  notes: string | null;
  completed: boolean;
  lastUpdated: number | null;
}

export interface QuestionWithAnswer extends Question {
  answer: string;
  aiGeneratedAt: number;
  aiModel: string;
}
