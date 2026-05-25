/*
  Warnings:

  - You are about to drop the column `sourceLink` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `video` on the `Lesson` table. All the data in the column will be lost.
  - Added the required column `url` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "sourceLink",
DROP COLUMN "video",
ADD COLUMN     "url" TEXT NOT NULL;
