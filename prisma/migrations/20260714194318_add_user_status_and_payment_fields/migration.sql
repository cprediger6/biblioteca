-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastPaymentDate" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';
