-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "type" VARCHAR,
    "provider" VARCHAR,
    "providerAccountId" TEXT,
    "access_token" VARCHAR,
    "expires_at" INTEGER,
    "token_type" VARCHAR,
    "scope" VARCHAR,
    "id_token" VARCHAR NOT NULL,
    "session_state" VARCHAR,
    "refresh_token" VARCHAR,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id","id_token")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" BIGSERIAL NOT NULL,
    "sessionToken" VARCHAR NOT NULL,
    "userid" INTEGER NOT NULL,
    "expires" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR,
    "email" VARCHAR NOT NULL,
    "image" VARCHAR,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailVerified" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audiotracks" (
    "id" SERIAL NOT NULL,
    "postid" INTEGER NOT NULL,
    "trackname" VARCHAR,
    "artist" VARCHAR,
    "album" VARCHAR,
    "releaseyear" INTEGER,
    "coverartfile" VARCHAR,

    CONSTRAINT "audiotracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "city" VARCHAR NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commentstopost" (
    "id" SERIAL NOT NULL,
    "postid" INTEGER NOT NULL,
    "commentpostid" INTEGER NOT NULL,

    CONSTRAINT "commentsToPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "eventname" VARCHAR,
    "eventdate" TIMESTAMPTZ(6),
    "venueid" INTEGER,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filetypes" (
    "id" SERIAL NOT NULL,
    "filetype" VARCHAR NOT NULL,

    CONSTRAINT "filetypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "followers" (
    "id" SERIAL NOT NULL,
    "followinguserdetailsid" INTEGER NOT NULL,
    "userdetailsid" INTEGER NOT NULL,

    CONSTRAINT "followers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "notificationtypeid" INTEGER NOT NULL,
    "read" BOOLEAN DEFAULT false,
    "createdat" TIMESTAMPTZ(6) NOT NULL,
    "postid" INTEGER,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificationtypes" (
    "id" SERIAL NOT NULL,
    "notificationtype" VARCHAR NOT NULL,

    CONSTRAINT "notificationTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postlikes" (
    "id" SERIAL NOT NULL,
    "userdetailsid" INTEGER NOT NULL,
    "postid" INTEGER NOT NULL,

    CONSTRAINT "postlikes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" SERIAL NOT NULL,
    "content" VARCHAR,
    "lexical" VARCHAR,
    "createdat" TIMESTAMPTZ(6) NOT NULL,
    "updatedat" TIMESTAMPTZ(6) NOT NULL,
    "edited" BOOLEAN DEFAULT false,
    "posttypeid" INTEGER NOT NULL,
    "postfile" VARCHAR,
    "privatepost" BOOLEAN DEFAULT false,
    "eventid" INTEGER,
    "postfiletypeid" INTEGER,
    "isgalleryfile" BOOLEAN DEFAULT false,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posttypes" (
    "id" SERIAL NOT NULL,
    "posttype" VARCHAR NOT NULL,

    CONSTRAINT "postTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "states" (
    "id" SERIAL NOT NULL,
    "stateabbr" VARCHAR NOT NULL,
    "statefullname" VARCHAR,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userdetails" (
    "id" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "displayname" VARCHAR,
    "userdir" VARCHAR,
    "createdat" TIMESTAMPTZ(6) NOT NULL,
    "updatedat" TIMESTAMPTZ(6),
    "avatar" VARCHAR,
    "handle" VARCHAR,
    "biohtml" VARCHAR,
    "biolexical" VARCHAR,
    "suspended" BOOLEAN DEFAULT false,

    CONSTRAINT "userDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userdetailsurls" (
    "id" SERIAL NOT NULL,
    "userdetailsid" INTEGER NOT NULL,
    "url" VARCHAR NOT NULL,
    "urlname" VARCHAR,

    CONSTRAINT "userDetailsUrls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userstonotifications" (
    "id" SERIAL NOT NULL,
    "notificationid" INTEGER NOT NULL,
    "senderuserdetailsid" INTEGER NOT NULL,
    "receiveruserdetailsid" INTEGER NOT NULL,

    CONSTRAINT "usersToNotifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usertoposts" (
    "id" SERIAL NOT NULL,
    "userdetailsid" INTEGER NOT NULL,
    "postid" INTEGER NOT NULL,

    CONSTRAINT "userToPosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" SERIAL NOT NULL,
    "venuename" VARCHAR NOT NULL,
    "address" VARCHAR,
    "cityid" INTEGER,
    "stateid" INTEGER,
    "zipcodeid" INTEGER,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zipcodes" (
    "id" SERIAL NOT NULL,
    "zipcode" VARCHAR NOT NULL,

    CONSTRAINT "zipcodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessionTokenUnique" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "emailUnique" ON "User"("email");

-- CreateIndex
CREATE INDEX "postfile_IX" ON "posts"("postfile");

-- CreateIndex
CREATE UNIQUE INDEX "user" ON "userdetails"("userid");

-- CreateIndex
CREATE INDEX "name_IX" ON "userdetails"("displayname", "handle");

-- CreateIndex
CREATE INDEX "venueName_IX" ON "venues"("venuename");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "usersFK" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "audiotracks" ADD CONSTRAINT "postid_fk" FOREIGN KEY ("postid") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commentstopost" ADD CONSTRAINT "commentFK" FOREIGN KEY ("commentpostid") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commentstopost" ADD CONSTRAINT "postFK" FOREIGN KEY ("postid") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "venueFK" FOREIGN KEY ("venueid") REFERENCES "venues"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followeeUserDetailsFK" FOREIGN KEY ("followinguserdetailsid") REFERENCES "userdetails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followerUserDetailsFK" FOREIGN KEY ("userdetailsid") REFERENCES "userdetails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notificationTypeFK" FOREIGN KEY ("notificationtypeid") REFERENCES "notificationtypes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "postlikes" ADD CONSTRAINT "postidFK" FOREIGN KEY ("postid") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "postlikes" ADD CONSTRAINT "userdetailsidFK" FOREIGN KEY ("userdetailsid") REFERENCES "userdetails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "eventsFK" FOREIGN KEY ("eventid") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "postTypeFK" FOREIGN KEY ("posttypeid") REFERENCES "posttypes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "postfiletypeFK" FOREIGN KEY ("postfiletypeid") REFERENCES "filetypes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "userdetails" ADD CONSTRAINT "usersFK" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "userdetailsurls" ADD CONSTRAINT "userDetailsFK" FOREIGN KEY ("userdetailsid") REFERENCES "userdetails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "userstonotifications" ADD CONSTRAINT "notificationFK" FOREIGN KEY ("notificationid") REFERENCES "notifications"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "userstonotifications" ADD CONSTRAINT "receiverUserDetailsFK" FOREIGN KEY ("receiveruserdetailsid") REFERENCES "userdetails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "userstonotifications" ADD CONSTRAINT "senderUserDetailsId" FOREIGN KEY ("senderuserdetailsid") REFERENCES "userdetails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usertoposts" ADD CONSTRAINT "postFK" FOREIGN KEY ("postid") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usertoposts" ADD CONSTRAINT "userDetailFK" FOREIGN KEY ("userdetailsid") REFERENCES "userdetails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "citiesFK" FOREIGN KEY ("cityid") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "statesFK" FOREIGN KEY ("stateid") REFERENCES "states"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "zipcodeFK" FOREIGN KEY ("zipcodeid") REFERENCES "zipcodes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
