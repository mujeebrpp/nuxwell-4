-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'USER';
ALTER TYPE "Role" ADD VALUE 'PENDING_MEMBER';

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "TeaBooking" ADD COLUMN     "isMultiSlot" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TeaBookingSlot" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeaBookingSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poll" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "familyId" TEXT,
    "membershipId" TEXT,
    "pollId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "groupSize" INTEGER NOT NULL,
    "specialRequest" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PollBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeaBookingSlot_bookingId_idx" ON "TeaBookingSlot"("bookingId");

-- CreateIndex
CREATE INDEX "PollBooking_date_pollId_idx" ON "PollBooking"("date", "pollId");

-- CreateIndex
CREATE INDEX "PollBooking_userId_date_idx" ON "PollBooking"("userId", "date");

-- CreateIndex
CREATE INDEX "PollBooking_familyId_idx" ON "PollBooking"("familyId");

-- AddForeignKey
ALTER TABLE "TeaBookingSlot" ADD CONSTRAINT "TeaBookingSlot_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "TeaBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Poll" ADD CONSTRAINT "Poll_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollBooking" ADD CONSTRAINT "PollBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollBooking" ADD CONSTRAINT "PollBooking_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollBooking" ADD CONSTRAINT "PollBooking_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollBooking" ADD CONSTRAINT "PollBooking_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
