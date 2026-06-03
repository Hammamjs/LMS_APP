-- DropIndex
DROP INDEX "Review_courseId_userId_key";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "deletedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX unique_active_user_course_review 
ON "Review"("courseId", "userId") 
WHERE "deletedAt" IS NULL;