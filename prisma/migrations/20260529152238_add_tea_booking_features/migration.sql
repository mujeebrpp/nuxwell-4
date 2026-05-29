/*
  Warnings:

  - Made the column `groupSize` on table `TeaBooking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "teaBookingCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TeaBooking" ADD COLUMN     "depositAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "depositPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "familyId" TEXT,
ADD COLUMN     "specialRequest" TEXT,
ALTER COLUMN "groupSize" SET NOT NULL;

-- CreateTable
CREATE TABLE "TeaMenu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'individual',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeaMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeaOrderItem" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "specialReq" TEXT,

    CONSTRAINT "TeaOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeaCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeaCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeaSession" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "tableId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "frequency" TEXT,
    "dayOfWeek" INTEGER,
    "endDate" TIMESTAMP(3),
    "groupSize" INTEGER NOT NULL,
    "foodOrder" JSONB,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeaSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeaPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "sessions" INTEGER NOT NULL,
    "validDays" INTEGER NOT NULL,
    "discount" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeaPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeaPackageRedemption" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeaPackageRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyRewardTransaction" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "redeemedById" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FamilyRewardTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeaMenu_category_idx" ON "TeaMenu"("category");

-- CreateIndex
CREATE INDEX "TeaMenu_isAvailable_idx" ON "TeaMenu"("isAvailable");

-- CreateIndex
CREATE INDEX "TeaOrderItem_bookingId_idx" ON "TeaOrderItem"("bookingId");

-- CreateIndex
CREATE INDEX "TeaOrderItem_menuId_idx" ON "TeaOrderItem"("menuId");

-- CreateIndex
CREATE INDEX "TeaSession_familyId_date_idx" ON "TeaSession"("familyId", "date");

-- CreateIndex
CREATE INDEX "TeaSession_status_idx" ON "TeaSession"("status");

-- CreateIndex
CREATE INDEX "TeaPackage_isActive_idx" ON "TeaPackage"("isActive");

-- CreateIndex
CREATE INDEX "TeaPackageRedemption_familyId_idx" ON "TeaPackageRedemption"("familyId");

-- CreateIndex
CREATE INDEX "TeaPackageRedemption_packageId_idx" ON "TeaPackageRedemption"("packageId");

-- CreateIndex
CREATE INDEX "TeaBooking_userId_date_idx" ON "TeaBooking"("userId", "date");

-- CreateIndex
CREATE INDEX "TeaBooking_familyId_idx" ON "TeaBooking"("familyId");

-- CreateIndex
CREATE INDEX "TeaBooking_status_idx" ON "TeaBooking"("status");

-- CreateIndex
CREATE INDEX "TeaBooking_date_idx" ON "TeaBooking"("date");

-- AddForeignKey
ALTER TABLE "TeaBooking" ADD CONSTRAINT "TeaBooking_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeaOrderItem" ADD CONSTRAINT "TeaOrderItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "TeaBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeaOrderItem" ADD CONSTRAINT "TeaOrderItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "TeaMenu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeaSession" ADD CONSTRAINT "TeaSession_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeaSession" ADD CONSTRAINT "TeaSession_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "TeaTable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeaPackageRedemption" ADD CONSTRAINT "TeaPackageRedemption_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeaPackageRedemption" ADD CONSTRAINT "TeaPackageRedemption_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "TeaPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyRewardTransaction" ADD CONSTRAINT "FamilyRewardTransaction_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyRewardTransaction" ADD CONSTRAINT "FamilyRewardTransaction_redeemedById_fkey" FOREIGN KEY ("redeemedById") REFERENCES "Profile"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
