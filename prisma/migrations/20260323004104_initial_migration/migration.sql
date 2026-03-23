-- CreateTable
CREATE TABLE "PostIt" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "textColor" TEXT NOT NULL,
    "textureId" TEXT NOT NULL,
    "textureColor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostIt_pkey" PRIMARY KEY ("id")
);
