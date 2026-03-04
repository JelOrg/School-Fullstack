/*
  Warnings:

  - You are about to drop the `department` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `departmentId` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `departmentId` INTEGER NOT NULL,
    ADD COLUMN `roleId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `department`;

-- CreateTable
CREATE TABLE `Departments` (
    `departmentId` INTEGER NOT NULL AUTO_INCREMENT,
    `departmentName` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`departmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Roles`(`roleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Departments`(`departmentId`) ON DELETE RESTRICT ON UPDATE CASCADE;
