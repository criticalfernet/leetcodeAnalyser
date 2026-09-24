import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", async function (req, res) {
  try {
    const { questionId } = req.body;

    if (!questionId) {
      return res.status(400).json({
        error: "questionId is required",
      });
    }

    const question = await prisma.question.findUnique({
      where: {
        id: Number(questionId),
      },
    });

    if (!question) {
      return res.status(404).json({
        error: "Question not found",
      });
    }

    const lastAccepted = await getLastAccepted(question.titleSlug);

    if (!lastAccepted) {
      return res.json({
        message: "Question has not been accepted",
      });
    }

    const lastAcceptedAt = new Date(Number(lastAccepted) * 1000);

    const user = await prisma.user.upsert({
      where: {
        username: "admin",
      },
      update: {},
      create: {
        username: "admin",
      },
    });

    const progress = await prisma.userQuestionProgress.upsert({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId: Number(questionId),
        },
      },
      update: {
        lastAcceptedAt: lastAcceptedAt,
      },
      create: {
        userId: user.id,
        questionId: Number(questionId),
        lastAcceptedAt: lastAcceptedAt,
      },
    });

    res.json({
      progress,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update progress",
    });
  }
});


router.get("/", async function (req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: "admin",
      },
    });

    if (!user) {
      return res.json({
        progress: [],
      });
    }

    const progress = await prisma.userQuestionProgress.findMany({
      where: {
        userId: user.id,
      },
      select: {
        questionId: true,
        lastAcceptedAt: true,
      },
    });

    res.json({
      progress: progress.map(item => {
        return {
          questionId: item.questionId,
          lastAccepted: item.lastAcceptedAt,
        };
      }),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch progress",
    });
  }
});

router.get("/:topic", async function (req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: "admin",
      },
    });

    if (!user) {
      return res.json({
        questionIds: [],
      });
    }

    const progress = await prisma.userQuestionProgress.findMany({
      where: {
        userId: user.id,
        question: {
          topics: {
            some: {
              slug: req.params.topic,
            },
          },
        },
      },
      select: {
        questionId: true,
      },
    });

    res.json({
      questionIds: progress.map(function (item) {
        return item.questionId;
      }),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch topic progress",
    });
  }
});

router.post("/extension", async (req, res) => {
  try {
    const { slug } = req.body;

    if (!slug) {
      return res.status(400).json({
        error: "slug is required",
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 5000)); //5 sec for lc to sync

    const question = await prisma.question.findUnique({
      where: {
        titleSlug: slug,
      },
    });

    if (!question) {
      return res.status(404).json({
        error: "Question not found",
      });
    }

    const lastAccepted = await getLastAccepted(slug);

    if (!lastAccepted) {
      return res.json({
        message: "Question has not been accepted",
      });
    }

    const lastAcceptedAt = new Date(Number(lastAccepted) * 1000);

    const user = await prisma.user.upsert({
      where: {
        username: "admin",
      },
      update: {},
      create: {
        username: "admin",
      },
    });

    const progress = await prisma.userQuestionProgress.upsert({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId: question.id,
        },
      },
      update: {
        lastAcceptedAt,
      },
      create: {
        userId: user.id,
        questionId: question.id,
        lastAcceptedAt,
      },
    });

    return res.json({
      progress,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to update progress",
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

  const submissions = result.data.submissionList.submissions ?? [];

  console.log("result:", result.data.submissionList);

  const accepted = submissions.find(function (submission) {
    return submission.statusDisplay === "Accepted";
  });

  return accepted?.timestamp ?? null;
}