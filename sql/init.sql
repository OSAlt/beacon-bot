DROP DATABASE IF EXISTS `beaconbot`;
CREATE DATABASE `beaconbot`;
USE `beaconbot`;

DROP TABLE IF EXISTS `autoroles`;
CREATE TABLE `autoroles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


DROP TABLE IF EXISTS `bans`;
CREATE TABLE `bans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` text COLLATE utf8mb4_bin NOT NULL,
  `guild_id` text COLLATE utf8mb4_bin NOT NULL,
  `reason` text COLLATE utf8mb4_bin NOT NULL,
  `unban_date` datetime NOT NULL,
  `moderator_id` text COLLATE utf8mb4_bin NOT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


DROP TABLE IF EXISTS `joinable_roles`;
CREATE TABLE `joinable_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `user_id` text COLLATE utf8mb4_bin NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


DROP TABLE IF EXISTS `triggers`;
CREATE TABLE `triggers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trigger` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `severity` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


DROP TABLE IF EXISTS `warnings`;
CREATE TABLE `warnings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `warning_id` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `user_id` bigint NOT NULL,
  `banned_words` text COLLATE utf8mb4_bin,
  `strikes` int DEFAULT NULL,
  `reason` text COLLATE utf8mb4_bin,
  `mod_id` bigint DEFAULT NULL,
  `username` text COLLATE utf8mb4_bin,
  `triggers` text COLLATE utf8mb4_bin,
  `message` text COLLATE utf8mb4_bin,
  `message_link` text COLLATE utf8mb4_bin,
  `severity` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `channel_id` bigint DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

