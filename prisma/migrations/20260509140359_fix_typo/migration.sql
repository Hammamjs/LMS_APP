/*
  Warnings:

  - The values [Intermidate] on the enum `Level` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Level_new" AS ENUM ('Beginner', 'Intermediate', 'Advance');
ALTER TABLE "public"."Courses" ALTER COLUMN "Level" DROP DEFAULT;
ALTER TABLE "Courses" ALTER COLUMN "Level" TYPE "Level_new" USING ("Level"::text::"Level_new");
ALTER TYPE "Level" RENAME TO "Level_old";
ALTER TYPE "Level_new" RENAME TO "Level";
DROP TYPE "public"."Level_old";
ALTER TABLE "Courses" ALTER COLUMN "Level" SET DEFAULT 'Beginner';
COMMIT;
