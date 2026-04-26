/*
  Warnings:

  - A unique constraint covering the columns `[name,providerId]` on the table `meal_categories` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "meal_categories_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "meal_categories_name_providerId_key" ON "meal_categories"("name", "providerId");
