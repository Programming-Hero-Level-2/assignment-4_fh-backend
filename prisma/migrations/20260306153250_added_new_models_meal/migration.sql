-- CreateEnum
CREATE TYPE "MealStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateTable
CREATE TABLE "meals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2),
    "imageUrl" TEXT,
    "status" "MealStatus" NOT NULL DEFAULT 'AVAILABLE',
    "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "isVegan" BOOLEAN NOT NULL DEFAULT false,
    "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
    "preparationTime" INTEGER,
    "providerId" TEXT NOT NULL,
    "mealCategoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" "CategoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "providerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meals_slug_key" ON "meals"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "meals_providerId_key" ON "meals"("providerId");

-- CreateIndex
CREATE INDEX "meals_slug_idx" ON "meals"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "meal_categories_name_key" ON "meal_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "meal_categories_slug_key" ON "meal_categories"("slug");

-- CreateIndex
CREATE INDEX "meal_categories_status_idx" ON "meal_categories"("status");

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_mealCategoryId_fkey" FOREIGN KEY ("mealCategoryId") REFERENCES "meal_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_categories" ADD CONSTRAINT "meal_categories_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
