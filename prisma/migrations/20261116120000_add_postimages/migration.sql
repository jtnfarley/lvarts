-- CreateTable
CREATE TABLE "postimages" (
    "id" SERIAL NOT NULL,
    "postid" INTEGER NOT NULL,
    "filename" VARCHAR NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "postimages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "postimages_post_position_unique" ON "postimages"("postid", "position");

-- AddForeignKey
ALTER TABLE "postimages" ADD CONSTRAINT "postimages_postFK" FOREIGN KEY ("postid") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
