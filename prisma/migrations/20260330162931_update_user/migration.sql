/*
  Warnings:

  - You are about to drop the column `passwordChangedAt` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetCode` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetExpires` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `passwordVerification` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `verificationCode` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "passwordChangedAt",
DROP COLUMN "passwordResetCode",
DROP COLUMN "passwordResetExpires",
DROP COLUMN "passwordVerification",
DROP COLUMN "verificationCode",
ADD COLUMN     "passwordUpdatedAt" TIMESTAMP(3);
