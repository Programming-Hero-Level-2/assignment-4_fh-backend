-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "cuisines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" "CategoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuisines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "businessEmail" TEXT,
    "logo" TEXT,
    "cover" TEXT,
    "ownerId" TEXT NOT NULL,
    "openingHours" TEXT NOT NULL,
    "closingHours" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deliveryTime" INTEGER NOT NULL DEFAULT 0,
    "minimumOrderAmount" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CuisineToProviderProfile" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CuisineToProviderProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "cuisines_name_key" ON "cuisines"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cuisines_slug_key" ON "cuisines"("slug");

-- CreateIndex
CREATE INDEX "cuisines_status_idx" ON "cuisines"("status");

-- CreateIndex
CREATE UNIQUE INDEX "provider_profiles_ownerId_key" ON "provider_profiles"("ownerId");

-- CreateIndex
CREATE INDEX "_CuisineToProviderProfile_B_index" ON "_CuisineToProviderProfile"("B");

-- AddForeignKey
ALTER TABLE "provider_profiles" ADD CONSTRAINT "provider_profiles_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CuisineToProviderProfile" ADD CONSTRAINT "_CuisineToProviderProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "cuisines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CuisineToProviderProfile" ADD CONSTRAINT "_CuisineToProviderProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
