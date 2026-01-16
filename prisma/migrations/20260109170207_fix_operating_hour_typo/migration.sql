/*
  Warnings:

  - You are about to drop the column `oprating_hour` on the `stores` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "stores" DROP COLUMN "oprating_hour",
ADD COLUMN     "operating_hour" JSONB;
