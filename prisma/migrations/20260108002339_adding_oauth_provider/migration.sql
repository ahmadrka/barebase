-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('GOOGLE', 'FACEBOOK', 'MICROSOFT');

-- CreateTable
CREATE TABLE "login_providers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider" "Provider" NOT NULL,
    "provider_id" TEXT NOT NULL,

    CONSTRAINT "login_providers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "login_providers_provider_provider_id_key" ON "login_providers"("provider", "provider_id");

-- AddForeignKey
ALTER TABLE "login_providers" ADD CONSTRAINT "login_providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
