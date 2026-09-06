import express from "express";
import { PrismaClient } from "@prisma/client";
import {
  fetchQuestionCount,
  fetchAllQuestions,
} from "./question.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const lcTotal = (await fetchQuestionCount()).totalNum;

    const seededCount = await prisma.question.count();

    if (seededCount >= lcTotal) {
      return res.json({
        synced: true,
        seeded: seededCount,
        total: lcTotal,
        message: "Database is already up to date",
      });
    }

    const result = await fetchAllQuestions(seededCount);

    res.json({
      synced: true,
      seeded: result.questions.length,
      total: result.totalNum,
       message: "Database synced successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to sync questions",
    });
  }
});

export default router;