import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/", (req, res) => {
  res.json({
    message: "API is working!",
  });
});

router.get("/test", async function (req, res) {
  try {
    const questionId = 1916;

    const question = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      return res.status(404).json({
        error: "Question not found",
      });
    }

    const lastAccepted = await getLastAccepted(question.titleSlug);

    res.json({
      questionId: question.id,
      titleSlug: question.titleSlug,
      lastAccepted: lastAccepted,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to test progress",
    });
  }
});

export default router;


async function getLastAccepted(questionSlug) {
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": `LEETCODE_SESSION=${process.env.LEETCODE_SESSION}`,
    },
    body: JSON.stringify({
      query: `
        query submissionList(
          $offset: Int!
          $limit: Int!
          $questionSlug: String!
        ) {
          submissionList(
            offset: $offset
            limit: $limit
            questionSlug: $questionSlug
          ) {
            submissions {
              statusDisplay
              timestamp
            }
          }
        }
      `,
      variables: {
        offset: 0,
        limit: 20,
        questionSlug: questionSlug,
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

  const submissions = result.data.submissionList.submissions;

  const accepted = submissions.find(function (submission) {
    return submission.statusDisplay === "Accepted";
  });

  return accepted?.timestamp ?? null;
}