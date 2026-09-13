/*
  Warnings:

  - A unique constraint covering the columns `[titleSlug]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `titleSlug` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "titleSlug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Question_titleSlug_key" ON "Question"("titleSlug");
