/*
  Warnings:

  - The primary key for the `request` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `amountRequested` on the `request` table. All the data in the column will be lost.
  - You are about to drop the column `requestDate` on the `request` table. All the data in the column will be lost.
  - You are about to drop the column `requestIndex` on the `request` table. All the data in the column will be lost.
  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `requestBatchId` to the `request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestedAmount` to the `request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleName` to the `role` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `item` DROP FOREIGN KEY `Item_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `request` DROP FOREIGN KEY `Request_itemId_fkey`;

-- DropForeignKey
ALTER TABLE `request` DROP FOREIGN KEY `Request_userId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_departmentId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_roleId_fkey`;

-- DropIndex
DROP INDEX `Department_departmentId_idx` ON `department`;

-- DropIndex
DROP INDEX `Role_roleId_idx` ON `role`;

-- AlterTable
ALTER TABLE `department` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE `request` DROP PRIMARY KEY,
    DROP COLUMN `amountRequested`,
    DROP COLUMN `requestDate`,
    DROP COLUMN `requestIndex`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `requestBatchId` INTEGER NOT NULL,
    ADD COLUMN `requestedAmount` INTEGER NOT NULL,
    ADD COLUMN `requestedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MODIFY `requestId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`requestId`);

-- AlterTable
ALTER TABLE `role` ADD COLUMN `roleName` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `category`;

-- DropTable
DROP TABLE `item`;

-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `categories` (
    `categoryId` INTEGER NOT NULL AUTO_INCREMENT,
    `categoryName` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `itemId` INTEGER NOT NULL AUTO_INCREMENT,
    `itemName` VARCHAR(191) NOT NULL,
    `description` MEDIUMTEXT NOT NULL,
    `remainingAmount` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `Items_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`itemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipments` (
    `shipmentId` INTEGER NOT NULL AUTO_INCREMENT,
    `shipmentBatchId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `GTIN` INTEGER NOT NULL DEFAULT 0,
    `supplierId` INTEGER NOT NULL,
    `deliveryDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `experationDate` DATETIME(3) NOT NULL,
    `cost` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `Shipments_itemId_idx`(`itemId`),
    INDEX `Shipments_supplierId_idx`(`supplierId`),
    PRIMARY KEY (`shipmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `supplierId` INTEGER NOT NULL AUTO_INCREMENT,
    `supplierName` VARCHAR(191) NOT NULL,
    `Address` VARCHAR(191) NOT NULL,
    `Description` MEDIUMTEXT NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `Suppliers_supplierName_key`(`supplierName`),
    PRIMARY KEY (`supplierId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(50) NOT NULL,
    `lastName` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` TEXT NOT NULL,
    `roleId` INTEGER NOT NULL,
    `departmentId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `Users_email_key`(`email`),
    INDEX `Users_departmentId_idx`(`departmentId`),
    INDEX `Users_roleId_idx`(`roleId`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `Items_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`categoryId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request` ADD CONSTRAINT `Request_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`itemId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request` ADD CONSTRAINT `Request_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `Shipments_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`itemId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `Shipments_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`supplierId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `Users_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `department`(`departmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `Users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role`(`roleId`) ON DELETE RESTRICT ON UPDATE CASCADE;
