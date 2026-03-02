/*
  Warnings:

  - You are about to drop the column `joinedDate` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lasttName` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `firstName` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - You are about to drop the `departments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemId` to the `Shipments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierId` to the `Shipments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Shipments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Suppliers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `Users_departmentId_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `Users_roleId_fkey`;

-- AlterTable
ALTER TABLE `categories` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `items` ADD COLUMN `categoryId` INTEGER NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `shipments` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `itemId` INTEGER NOT NULL,
    ADD COLUMN `supplierId` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `suppliers` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `joinedDate`,
    DROP COLUMN `lasttName`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `lastName` VARCHAR(50) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `firstName` VARCHAR(50) NOT NULL;

-- DropTable
DROP TABLE `departments`;

-- DropTable
DROP TABLE `requests`;

-- DropTable
DROP TABLE `roles`;

-- CreateTable
CREATE TABLE `Department` (
    `departmentId` INTEGER NOT NULL AUTO_INCREMENT,
    `departmentName` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`departmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `roleId` INTEGER NOT NULL AUTO_INCREMENT,
    `roleName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Request` (
    `requestId` INTEGER NOT NULL AUTO_INCREMENT,
    `requestBatchId` INTEGER NOT NULL,
    `requestedAmount` INTEGER NOT NULL,
    `requestedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Request_userId_idx`(`userId`),
    INDEX `Request_itemId_idx`(`itemId`),
    PRIMARY KEY (`requestId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Items_categoryId_idx` ON `Items`(`categoryId`);

-- CreateIndex
CREATE INDEX `Shipments_itemId_idx` ON `Shipments`(`itemId`);

-- CreateIndex
CREATE INDEX `Shipments_supplierId_idx` ON `Shipments`(`supplierId`);

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`roleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`departmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Items`(`itemId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shipments` ADD CONSTRAINT `Shipments_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Items`(`itemId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shipments` ADD CONSTRAINT `Shipments_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Suppliers`(`supplierId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Items` ADD CONSTRAINT `Items_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Categories`(`categoryId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `users` RENAME INDEX `Users_departmentId_fkey` TO `Users_departmentId_idx`;

-- RenameIndex
ALTER TABLE `users` RENAME INDEX `Users_roleId_fkey` TO `Users_roleId_idx`;
