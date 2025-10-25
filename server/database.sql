-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 25, 2025 at 08:47 AM
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
  `mobile` varchar(15) NOT NULL,
  `qrcode` text NOT NULL,
  `email_sent` tinyint(1) NOT NULL DEFAULT '0',
  `attendance_status` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `profile_image` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_index` (`student_index`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `participants`
--

INSERT INTO `participants` (`id`, `name`, `student_index`, `email`, `mobile`, `qrcode`, `email_sent`, `attendance_status`, `created_at`, `profile_image`) VALUES
(29, 'Chiran Vidanagamage', '22IT0503', 'cmhara1@gmail.com', '0771214159', 'data:image/png;base64,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', 1, 1, '2025-10-24 16:42:01', NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ticket`
--

INSERT INTO `ticket` (`id`, `ticketname`, `image`, `created_at`) VALUES
(1, 'ggg', 'C:\\Users\\anjul\\Desktop\\ticket_system\\server\\uploads\\image-1760965183157-655918741.jpg', '2025-10-20 12:59:43');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
