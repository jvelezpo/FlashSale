-- CreateTable
CREATE TABLE "FlashSaleItems" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "beginAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);
