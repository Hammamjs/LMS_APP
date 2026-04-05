/*
  Warnings:

  - You are about to drop the column `insructorId` on the `courses` table. All the data in the column will be lost.
  - Added the required column `instructorId` to the `courses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_insructorId_fkey";

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "insructorId",
ADD COLUMN     "instructorId" TEXT NOT NULL,
ALTER COLUMN "image" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
