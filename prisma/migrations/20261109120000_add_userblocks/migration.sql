-- CreateTable
CREATE TABLE "userblocks" (
    "id" SERIAL NOT NULL,
    "blockeruserdetailsid" INTEGER NOT NULL,
    "blockeduserdetailsid" INTEGER NOT NULL,
    "createdat" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userblocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "userblocks_blocked_IX" ON "userblocks"("blockeduserdetailsid");

-- CreateIndex
CREATE UNIQUE INDEX "userblocks_pair_unique" ON "userblocks"("blockeruserdetailsid", "blockeduserdetailsid");

-- AddForeignKey
ALTER TABLE "userblocks" ADD CONSTRAINT "userblocks_blockerFK" FOREIGN KEY ("blockeruserdetailsid") REFERENCES "userdetails"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "userblocks" ADD CONSTRAINT "userblocks_blockedFK" FOREIGN KEY ("blockeduserdetailsid") REFERENCES "userdetails"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
