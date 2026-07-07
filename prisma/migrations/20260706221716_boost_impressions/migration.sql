/*
  Warnings:

  - You are about to drop the column `durationhours` on the `postboosts` table. All the data in the column will be lost.
  - Added the required column `impressionspurchased` to the `postboosts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "postboosts" DROP COLUMN "durationhours",
ADD COLUMN     "impressionspurchased" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "postboostimpressions" (
    "id" SERIAL NOT NULL,
    "postboostid" INTEGER NOT NULL,
    "userdetailsid" INTEGER NOT NULL,
    "createdat" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "postboostimpressions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "postboostimpressions_unique" ON "postboostimpressions"("postboostid", "userdetailsid");

-- AddForeignKey
ALTER TABLE "postboostimpressions" ADD CONSTRAINT "postboostimpressions_postboostFK" FOREIGN KEY ("postboostid") REFERENCES "postboosts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "postboostimpressions" ADD CONSTRAINT "postboostimpressions_userdetailsFK" FOREIGN KEY ("userdetailsid") REFERENCES "userdetails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
