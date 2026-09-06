import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const router = express.Router();

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

const query = `
  query problemsetQuestionList(
    $skip: Int
  ) {
    questionList(
      categorySlug: ""
      limit: 20
      skip: $skip
      filters: {}
    ) {
      totalNum
      data {
        questionFrontendId
        title
        difficulty
        topicTags {
            name
            slug
        }
      }
    }
  }
`;

const countQuery = `
  query {
    questionList(
      categorySlug: ""
      limit: 1
      skip: 0
      filters: {}
    ) {
      totalNum
    }
  }
`;

async function fetchQuestions(skip) {
  const response = await fetch(LEETCODE_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Leetcode-Analyser",
    },
    body: JSON.stringify({
      query,
      variables: {
        skip,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`LeetCode returned ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    console.error(result.errors);
    throw new Error("LeetCode GraphQL request failed");
  }

  return result.data.questionList;
};

//const DEV_HARD_LIMIT = 40;
export async function fetchAllQuestions(initialSkip = 0) {
  const questions = [];

  let skip = initialSkip;
  let totalNum;

  do {
    const result = await fetchQuestions(skip);

    totalNum = result.totalNum;
    questions.push(...result.data);

    skip += 20;
  } while (skip < totalNum);

  for (const question of questions) {
    await seedQuestion(question);
  }

  return {
    totalNum,
    questions,
  };
};

router.get("/", async (req, res) => {
  try {
    const skip = Number(req.query.skip) || 0;
    const result = await fetchAllQuestions(skip);

    res.json({
      total: result.totalNum,
      questions: result.questions,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch questions",
    });

  }
});


export async function fetchQuestionCount() {
  const response = await fetch(LEETCODE_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Leetcode-Analyser",
    },
    body: JSON.stringify({
      query: countQuery,
    }),
  });

  if (!response.ok) {
    throw new Error(`LeetCode returned ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    console.error(result.errors);
    throw new Error("LeetCode GraphQL request failed");
  }

  return result.data.questionList;
};

router.get("/count", async (req, res) => {
  try {
    const result = await fetchQuestionCount();

    res.json({
      total: result.totalNum,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch questions",
    });

  }
});



export default router;

async function seedTopic(topic) {
  return await prisma.topic.upsert({
    where: {
      slug: topic.slug,
    },
    update: {},
    create: {
      name: topic.name,
      slug: topic.slug,
    },
  });
}

async function seedQuestion(question) {
  const savedQuestion = await prisma.question.upsert({
    where: {
      frontendId: Number(question.questionFrontendId),
    },
    update: {},
    create: {
      frontendId: Number(question.questionFrontendId),
      title: question.title,
      difficulty: question.difficulty,
    },
  });

  for (const topic of question.topicTags) {
    const savedTopic = await seedTopic(topic);

    await prisma.question.update({
      where: {
        id: savedQuestion.id,
      },
      data: {
        topics: {
          connect: {
            id: savedTopic.id,
          },
        },
      },
    });
  }

  return savedQuestion;
}