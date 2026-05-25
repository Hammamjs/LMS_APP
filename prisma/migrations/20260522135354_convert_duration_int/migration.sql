/*
  Warnings:

  - Added the required column `duration` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "duration" INTEGER NOT NULL;
