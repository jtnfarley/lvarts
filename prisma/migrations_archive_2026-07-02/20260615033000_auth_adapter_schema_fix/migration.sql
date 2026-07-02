-- Align Auth.js tables with the Prisma adapter contract.
ALTER TABLE "Account" DROP CONSTRAINT "accounts_pkey";
ALTER TABLE "Account" ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");
ALTER TABLE "Account" ALTER COLUMN "type" SET NOT NULL;
ALTER TABLE "Account" ALTER COLUMN "provider" SET NOT NULL;
ALTER TABLE "Account" ALTER COLUMN "providerAccountId" SET NOT NULL;
ALTER TABLE "Account" ALTER COLUMN "id_token" DROP NOT NULL;

ALTER TABLE "Session"
ADD CONSTRAINT "Session_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE TABLE "VerificationToken" (
    "identifier" VARCHAR NOT NULL,
    "token" VARCHAR NOT NULL,
    "expires" TIMESTAMPTZ(6) NOT NULL
);

CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "identifier_token" ON "VerificationToken"("identifier", "token");
