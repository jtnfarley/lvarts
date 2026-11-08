-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "reporteruserdetailsid" INTEGER NOT NULL,
    "postid" INTEGER,
    "reporteduserdetailsid" INTEGER,
    "reason" VARCHAR NOT NULL,
    "details" VARCHAR,
    "status" VARCHAR NOT NULL DEFAULT 'open',
    "createdat" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedat" TIMESTAMPTZ(6),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_status_createdat_IX" ON "reports"("status", "createdat");

-- CreateIndex
CREATE UNIQUE INDEX "reports_reporter_post_unique" ON "reports"("reporteruserdetailsid", "postid");

-- CreateIndex
CREATE UNIQUE INDEX "reports_reporter_user_unique" ON "reports"("reporteruserdetailsid", "reporteduserdetailsid");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterFK" FOREIGN KEY ("reporteruserdetailsid") REFERENCES "userdetails"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporteduserFK" FOREIGN KEY ("reporteduserdetailsid") REFERENCES "userdetails"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_postFK" FOREIGN KEY ("postid") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

