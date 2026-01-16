/*
  Warnings:

  - You are about to drop the column `inviteCode` on the `stores` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[invite_code]` on the table `stores` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "stores" DROP COLUMN "inviteCode",
ADD COLUMN     "invite_code" VARCHAR(255),
ADD COLUMN     "oprating_hour" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "stores_invite_code_key" ON "stores"("invite_code");
