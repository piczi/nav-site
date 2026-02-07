-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "description" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "isShow" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Website" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "categoryId" TEXT NOT NULL,
    "isShow" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Website_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Click" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Click_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
