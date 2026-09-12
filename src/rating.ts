import { differenceInDays } from "date-fns";
import type { Progress, Question, Topic } from "./types";

const HALF_LIFE_DAYS = 30;

export function calculateTopicRating(topic: Topic,progress: Progress[]): number {
  const questionIds = new Set(
    topic.questions.map((question) => question.frontendId)
  );

  const questionMap = new Map(
    topic.questions.map((question) => [question.frontendId, question])
  );

  const topicProgress = progress.filter((item) =>
    questionIds.has(item.questionId)
  );

  let freshness = 0;

  for (const item of topicProgress) {

    const question = questionMap.get(item.questionId);
     if(!question) continue;

    const daysSinceSolved = differenceInDays(
      new Date(),
      new Date(item.lastAccepted)
    );

   

    freshness += Math.pow(2, -daysSinceSolved / HALF_LIFE_DAYS) * diffBias(question.difficulty);
  }

  const normalizedFreshness = freshness / topic.questions.length;

  return 1 - normalizedFreshness;
}

function diffBias(q : Question["difficulty"]) {
  if (q == "Easy") return 1.0;
  if (q == "Medium") return 1.3;
  if (q == "Hard") return 1.5;
  
  return 1.0;
}