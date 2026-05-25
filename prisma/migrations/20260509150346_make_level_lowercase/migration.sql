/*
  Warnings:

  - You are about to drop the column `Level` on the `Courses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Courses" DROP COLUMN "Level",
ADD COLUMN     "level" "Level" NOT NULL DEFAULT 'Beginner';
