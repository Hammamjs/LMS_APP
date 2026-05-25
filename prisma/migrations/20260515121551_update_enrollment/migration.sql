/*
  Warnings:

  - You are about to drop the column `progressPercentage` on the `Enrollment` table. All the data in the column will be lost.
  - Added the required column `totalLessonsCount` to the `Enrollment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Courses" ADD COLUMN     "language" TEXT,
ADD COLUMN     "requirements" TEXT[],
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "targetAudience" TEXT[],
ADD COLUMN     "whatYouLearn" TEXT[];

-- AlterTable
ALTER TABLE "Enrollment" DROP COLUMN "progressPercentage",
ADD COLUMN     "totalLessonsCount" INTEGER NOT NULL;
