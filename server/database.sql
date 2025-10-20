-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 20, 2025 at 11:50 AM
-- Server version: 8.0.43
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `batch_party`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
CREATE TABLE IF NOT EXISTS `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `username`, `password`, `created_at`) VALUES
(1, 'admin', 'password', '2025-10-20 10:02:25');

-- --------------------------------------------------------

--
-- Table structure for table `participants`
--

DROP TABLE IF EXISTS `participants`;
CREATE TABLE IF NOT EXISTS `participants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `student_index` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `qrcode` text NOT NULL,
  `email_sent` tinyint(1) NOT NULL DEFAULT '0',
  `attendance_status` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_index` (`student_index`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `participants`
--

INSERT INTO `participants` (`id`, `name`, `student_index`, `email`, `qrcode`, `email_sent`, `attendance_status`, `created_at`) VALUES
(1, 'Anjula Nawod', '22IT0513', 'anjulac2006@gmail.com', 'data:image/png;base64,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', 0, 0, '2025-10-20 11:34:41');

-- --------------------------------------------------------

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
CREATE TABLE IF NOT EXISTS `ticket` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticketname` varchar(100) NOT NULL,
  `image` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
