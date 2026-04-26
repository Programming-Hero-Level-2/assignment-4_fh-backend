-- CreateTable
CREATE TABLE "reviews" (
	"id" TEXT NOT NULL,
	"rating" INTEGER NOT NULL,
	"comment" TEXT NOT NULL,
	"orderId" TEXT NOT NULL,
	"userId" TEXT NOT NULL,
	"providerId" TEXT NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,

	CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
	CONSTRAINT "reviews_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5)
);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_orderId_key" ON "reviews"("orderId");

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

-- CreateIndex
CREATE INDEX "reviews_providerId_idx" ON "reviews"("providerId");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- AddForeignKey
ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_providerId_fkey"
FOREIGN KEY ("providerId") REFERENCES "provider_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
