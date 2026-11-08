-- CreateTable
CREATE TABLE "pushtokens" (
    "id" SERIAL NOT NULL,
    "userdetailsid" INTEGER NOT NULL,
    "token" VARCHAR NOT NULL,
    "createdat" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pushtokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pushtokens_token_unique" ON "pushtokens"("token");

-- CreateIndex
CREATE INDEX "pushtokens_userdetailsid_idx" ON "pushtokens"("userdetailsid");

-- AddForeignKey
ALTER TABLE "pushtokens" ADD CONSTRAINT "pushtokens_userdetailsFK" FOREIGN KEY ("userdetailsid") REFERENCES "userdetails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

