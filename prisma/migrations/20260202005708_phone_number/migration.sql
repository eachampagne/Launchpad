-- CreateTable
CREATE TABLE "PhoneNumbers" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "notifications" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PhoneNumbers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumbers_userId_key" ON "PhoneNumbers"("userId");

-- AddForeignKey
ALTER TABLE "PhoneNumbers" ADD CONSTRAINT "PhoneNumbers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
