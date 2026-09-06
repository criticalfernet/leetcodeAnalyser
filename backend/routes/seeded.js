import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/questions", async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        topics: true,
      },
    });

    res.json({
      questions,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch seeded questions",
    });

  }
});

router.get("/topics", async (req, res) => {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: {
        slug: "asc",
      },
      include: {
        questions: true,
      },
    });

    res.json({
      topics,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch seeded topics",
    });
  }

});

router.get("/count", async (req, res) => {
  try {
    const count = await prisma.question.count();

    res.json({
      total: count,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch seeded question count",
    });
  }
});

export default router;