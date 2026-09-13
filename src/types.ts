export interface Topic {
  id: number;
  name: string;
  slug: string;
  questions: Question[];
}

export interface Question {
    frontendId : number;
    title : string;
    titleSlug : string;
    difficulty : "Medium" | "Easy" | "Hard";
}

export interface Progress {
  questionId: number;
  lastAccepted: string;
}