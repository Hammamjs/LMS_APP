/*
  Warnings:

  - You are about to drop the column `passwordCodeVerified` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "passwordCodeVerified",
ADD COLUMN     "isPasswordCodeVerified" BOOLEAN NOT NULL DEFAULT false;
