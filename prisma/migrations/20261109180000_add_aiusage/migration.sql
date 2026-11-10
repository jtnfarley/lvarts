-- CreateTable
CREATE TABLE "aiusage" (
    "id" SERIAL NOT NULL,
    "userdetailsid" INTEGER NOT NULL,
    "kind" VARCHAR NOT NULL,
    "createdat" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aiusage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aiusage_user_kind_createdat_IX" ON "aiusage"("userdetailsid", "kind", "createdat");

-- CreateIndex
CREATE INDEX "aiusage_kind_createdat_IX" ON "aiusage"("kind", "createdat");

-- AddForeignKey
ALTER TABLE "aiusage" ADD CONSTRAINT "aiusage_userdetailsFK" FOREIGN KEY ("userdetailsid") REFERENCES "userdetails"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

