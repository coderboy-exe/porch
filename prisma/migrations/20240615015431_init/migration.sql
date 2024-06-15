/*
  Warnings:

  - You are about to drop the column `montlyAmount` on the `AddOnService` table. All the data in the column will be lost.
  - Added the required column `monthlyAmount` to the `AddOnService` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AddOnService" DROP COLUMN "montlyAmount",
ADD COLUMN     "monthlyAmount" INTEGER NOT NULL;
