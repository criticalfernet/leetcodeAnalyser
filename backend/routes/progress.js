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
        lastAcceptedAt: new Date(),
      },
      create: {
        userId: user.id,
        questionId: Number(questionId),
        lastAcceptedAt: new Date(),
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

export default router;