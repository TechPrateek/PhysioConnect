-- CreateEnum
CREATE TYPE "PhysioOnlineStatus" AS ENUM ('OFFLINE', 'ONLINE', 'BUSY');

-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('SEARCHING', 'OFFERED', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- DropIndex
DROP INDEX IF EXISTS "Availability_physiotherapistId_dayOfWeek_key";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10,7),
ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(10,7);

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "serviceRequestId" TEXT;

-- AlterTable
ALTER TABLE "Physiotherapist" ADD COLUMN IF NOT EXISTS "lastOnlineAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "onlineStatus" "PhysioOnlineStatus" NOT NULL DEFAULT 'OFFLINE';

-- CreateTable
CREATE TABLE IF NOT EXISTS "PhysiotherapistLocation" (
    "id" TEXT NOT NULL,
    "physiotherapistId" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "locationUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhysiotherapistLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ServiceRequest" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentType" "AppointmentType" NOT NULL,
    "addressId" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "chiefComplaint" TEXT,
    "notes" TEXT,
    "requestedDate" DATE,
    "requestedTime" TEXT,
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'SEARCHING',
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ServiceRequestOffer" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "physiotherapistId" TEXT NOT NULL,
    "distanceKm" DECIMAL(8,2),
    "estimatedMinutes" INTEGER,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "offeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "ServiceRequestOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PhysiotherapistLocation_physiotherapistId_key" ON "PhysiotherapistLocation"("physiotherapistId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PhysiotherapistLocation_latitude_longitude_idx" ON "PhysiotherapistLocation"("latitude", "longitude");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PhysiotherapistLocation_locationUpdatedAt_idx" ON "PhysiotherapistLocation"("locationUpdatedAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ServiceRequest_requestNumber_key" ON "ServiceRequest"("requestNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceRequest_patientId_idx" ON "ServiceRequest"("patientId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceRequest_status_idx" ON "ServiceRequest"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceRequest_appointmentType_idx" ON "ServiceRequest"("appointmentType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceRequest_createdAt_idx" ON "ServiceRequest"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceRequestOffer_serviceRequestId_status_idx" ON "ServiceRequestOffer"("serviceRequestId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ServiceRequestOffer_physiotherapistId_status_idx" ON "ServiceRequestOffer"("physiotherapistId", "status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ServiceRequestOffer_serviceRequestId_physiotherapistId_key" ON "ServiceRequestOffer"("serviceRequestId", "physiotherapistId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Booking_serviceRequestId_key" ON "Booking"("serviceRequestId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Physiotherapist_onlineStatus_idx" ON "Physiotherapist"("onlineStatus");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PhysiotherapistLocation_physiotherapistId_fkey') THEN
        ALTER TABLE "PhysiotherapistLocation" ADD CONSTRAINT "PhysiotherapistLocation_physiotherapistId_fkey" FOREIGN KEY ("physiotherapistId") REFERENCES "Physiotherapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServiceRequest_patientId_fkey') THEN
        ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServiceRequest_addressId_fkey') THEN
        ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServiceRequestOffer_serviceRequestId_fkey') THEN
        ALTER TABLE "ServiceRequestOffer" ADD CONSTRAINT "ServiceRequestOffer_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServiceRequestOffer_physiotherapistId_fkey') THEN
        ALTER TABLE "ServiceRequestOffer" ADD CONSTRAINT "ServiceRequestOffer_physiotherapistId_fkey" FOREIGN KEY ("physiotherapistId") REFERENCES "Physiotherapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Booking_serviceRequestId_fkey') THEN
        ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
