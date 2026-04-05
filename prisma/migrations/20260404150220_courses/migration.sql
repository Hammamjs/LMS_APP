/*
  Warnings:

  - You are about to drop the column `sourceLink` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `video` on the `courses` table. All the data in the column will be lost.
  - Added the required column `image` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insructorId` to the `courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "courses" DROP COLUMN "sourceLink",
DROP COLUMN "video",
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "insructorId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "video" TEXT,
    "sourceLink" TEXT,
    "order" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_insructorId_fkey" FOREIGN KEY ("insructorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
