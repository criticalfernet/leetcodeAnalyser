//import type { Progress } from "./types";

import type { Question, Topic, Progress } from "./types";

const API_URL = "http://localhost:5000/api";

export async function sync() {
  const response = await fetch(`${API_URL}/sync`);

  if (!response.ok) {
    console.error(`Sync failed: ${response.status}`);
  }
  //response.json().then(r => console.log(r));
}

export async function getTopics(): Promise<Topic[]> {
  const response = await fetch(`${API_URL}/seeded/topics`);
  const data = await response.json();
  return data.topics;
}

export async function getQuestionsCount() : Promise<number> {
  const response = await fetch(`${API_URL}/questions/count`);
  const data = await response.json();
  return data.total
}

export async function getQuestionsAll(): Promise<Question[]> {
  const response = await fetch(`${API_URL}/seeded/questions`);
  const data = await response.json();
  return data.questions;
}

export async function getQuestions(slug: string): Promise<Question[]> {
  const topics = await getTopics();

  return topics.find((topic) => topic.slug === slug)?.questions ?? [];
}

export async function markQuestionDone(questionId: number) {
  const response = await fetch(`${API_URL}/progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      questionId,
    }),
  });

  return response.json();
}

export async function getProgress(): Promise<{progress:Progress[]}> {
  const response = await fetch(`${API_URL}/progress`);
  return response.json();
}

export async function getProgressTopic(slug: string): Promise<{questionIds:number[]}> {
  const response = await fetch(`${API_URL}/progress/${slug}`);
  return response.json();
}