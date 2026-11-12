-- CreateTable
CREATE TABLE "importvenuemaps" (
    "id" SERIAL NOT NULL,
    "sourcekey" VARCHAR NOT NULL,
    "lookupkey" VARCHAR NOT NULL,
    "venueid" INTEGER NOT NULL,

    CONSTRAINT "importvenuemaps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "importvenuemaps_source_lookup_key" ON "importvenuemaps"("sourcekey", "lookupkey");

-- AddForeignKey
ALTER TABLE "importvenuemaps" ADD CONSTRAINT "importvenuemaps_venueFK" FOREIGN KEY ("venueid") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
