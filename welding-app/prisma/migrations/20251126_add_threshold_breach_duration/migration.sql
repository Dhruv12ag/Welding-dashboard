-- CreateTable
CREATE TABLE `threshold_breaches` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `machineId` INTEGER NOT NULL,
    `parameter` VARCHAR(191) NOT NULL,
    `breachCount` INTEGER NOT NULL DEFAULT 0,
    `normalCount` INTEGER NOT NULL DEFAULT 0,
    `lastReading` DOUBLE NOT NULL,
    `lastBreachAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `activeAlertId` BIGINT NULL,

    UNIQUE INDEX `threshold_breaches_machineId_parameter_key`(`machineId`, `parameter`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `threshold_breaches` ADD CONSTRAINT `threshold_breaches_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `machines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
