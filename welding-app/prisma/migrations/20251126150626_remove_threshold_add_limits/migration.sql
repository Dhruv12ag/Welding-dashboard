/*
  Warnings:

  - You are about to drop the `machine_thresholds` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `machine_thresholds` DROP FOREIGN KEY `machine_thresholds_machineId_fkey`;

-- AlterTable
ALTER TABLE `machines` ADD COLUMN `maxCurrent` DOUBLE NULL,
    ADD COLUMN `maxVoltage` DOUBLE NULL;

-- DropTable
DROP TABLE `machine_thresholds`;
