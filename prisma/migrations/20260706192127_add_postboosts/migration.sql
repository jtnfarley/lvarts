-- CreateTable
CREATE TABLE "postboosts" (
    "id" SERIAL NOT NULL,
    "postid" INTEGER NOT NULL,
    "userdetailsid" INTEGER NOT NULL,
    "budgetcents" INTEGER NOT NULL,
    "durationhours" INTEGER NOT NULL,
    "status" VARCHAR NOT NULL DEFAULT 'active',
    "stripepaymentintentid" VARCHAR NOT NULL,
    "activatedat" TIMESTAMPTZ(6),
    "expiresat" TIMESTAMPTZ(6),
    "createdat" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "postboosts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "postboosts_stripepaymentintentid_key" ON "postboosts"("stripepaymentintentid");

-- CreateIndex
CREATE INDEX "postboosts_status_expiresat_IX" ON "postboosts"("status", "expiresat");

-- CreateIndex
CREATE INDEX "postboosts_postid_IX" ON "postboosts"("postid");

-- AddForeignKey
ALTER TABLE "postboosts" ADD CONSTRAINT "postboosts_postFK" FOREIGN KEY ("postid") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "postboosts" ADD CONSTRAINT "postboosts_userdetailsFK" FOREIGN KEY ("userdetailsid") REFERENCES "userdetails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
