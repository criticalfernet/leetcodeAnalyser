import { differenceInDays } from "date-fns";
import type { Progress, Topic } from "./types";

const HALF_LIFE_DAYS = 30;

export function calculateTopicRating(topic: Topic,progress: Progress[]): number {
  const questionIds = new Set(
    topic.questions.map((question) => question.frontendId)
  );

  const topicProgress = progress.filter((item) =>
    questionIds.has(item.questionId)
  );

  let freshness = 0;

  for (const item of topicProgress) {
    const daysSinceSolved = differenceInDays(
      new Date(),
      new Date(item.lastAccepted)
    );

    freshness += Math.pow(2, -daysSinceSolved / HALF_LIFE_DAYS);
  }

  const normalizedFreshness = freshness / topic.questions.length;

  return 1 - normalizedFreshness;
}