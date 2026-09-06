import express, { json } from "express";
import { config } from "dotenv";
import cors from "cors";

import testRouter from "./routes/test.js";
import questionRouter from "./routes/question.js";
import seededRouter from "./routes/seeded.js";
import syncRouter from "./routes/sync.js";
import progressRouter from "./routes/progress.js";

config();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(json());
app.use(cors());
app.use("/api", testRouter);
app.use("/api/questions", questionRouter);
app.use("/api/seeded", seededRouter);
app.use("/api/sync", syncRouter);
app.use("/api/progress", progressRouter);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));