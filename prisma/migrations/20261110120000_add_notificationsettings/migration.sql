-- CreateTable
CREATE TABLE "notificationsettings" (
    "userdetailsid" INTEGER NOT NULL,
    "pushpaused" BOOLEAN NOT NULL DEFAULT false,
    "pushlikes" BOOLEAN NOT NULL DEFAULT true,
    "pushcomments" BOOLEAN NOT NULL DEFAULT true,
    "pushmentions" BOOLEAN NOT NULL DEFAULT true,
    "pushfollows" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notificationsettings_pkey" PRIMARY KEY ("userdetailsid")
);

-- AddForeignKey
ALTER TABLE "notificationsettings" ADD CONSTRAINT "notificationsettings_userdetailsFK" FOREIGN KEY ("userdetailsid") REFERENCES "userdetails"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
