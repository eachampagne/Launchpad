-- AlterTable
ALTER TABLE "GoogleToken" ADD COLUMN     "refresh_expiry_date" TIMESTAMP(3),
ADD COLUMN     "refresh_token" TEXT;
