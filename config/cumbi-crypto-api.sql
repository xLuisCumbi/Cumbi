-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 13, 2023 at 06:36 AM
-- Server version: 10.4.22-MariaDB
-- PHP Version: 7.4.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cumbi-crypto-api`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `admin_id` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `passphrase` varchar(500) NOT NULL,
  `token` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `admin_id`, `username`, `email`, `password`, `passphrase`, `token`, `createdAt`, `updatedAt`) VALUES
(1, '9876567389', 'Luiz Miguel', 'luiz@gmail.com', '$2a$10$nYoVG5O1oQn4NFUa17.WLe.fARDN6u21v8doj0re0qLz1qmgwAtPq', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtbmVtb25pYyI6Imhpc3RvcnkgdHdlbnR5IGFwcmlsIGV4dHJhIGhvcGUgbnVyc2UgcHJldmVudCBidWxsZXQgcG9ldCBjbGVyayBqZWxseSBjaGVzdCIsImlhdCI6MTY4ODg5NTcyMywiZXhwIjoxNjkyNDk1NzIzfQ.LDBgBASny3lhnVvti-qExqXcXHKWsQ2goAtxAaK_zRo', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbl9pZCI6OTg3NjU2NzM4OSwidHlwZSI6ImFkbWluX3Rva2VuIiwiaWF0IjoxNjg4ODk2MDI5LCJleHAiOjE2ODg5MTQwMjl9.fYRB3Ewn3-xqfKG9ucfyfHmTpfqZ9MT_ApWhJhBWeOg', '2023-07-09 10:57:21', '2023-07-09 10:57:21');

-- --------------------------------------------------------

--
-- Table structure for table `api_token`
--

CREATE TABLE `api_token` (
  `id` int(11) NOT NULL,
  `token_name` varchar(255) NOT NULL,
  `token` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `api_token`
--

INSERT INTO `api_token` (`id`, `token_name`, `token`) VALUES
(1, 'test token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdCB0b2tlbiIsInR5cGUiOiJhcGlfdG9rZW4iLCJpYXQiOjE2ODg4OTYzMDcsImV4cCI6MTg0NjY4NDMwN30.JAlJkCYBtvvNQhepU1ZyfkhgkfLrEtvxKxNrwfKChX4');

-- --------------------------------------------------------

--
-- Table structure for table `deposit`
--

CREATE TABLE `deposit` (
  `id` int(11) NOT NULL,
  `address` varchar(255) NOT NULL,
  `address_index` int(11) NOT NULL,
  `privateKey` varchar(500) NOT NULL,
  `coin` varchar(255) NOT NULL,
  `network` varchar(255) NOT NULL,
  `amount` float NOT NULL,
  `amount_usd` float NOT NULL,
  `deposit_id` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `consolidation_status` varchar(255) DEFAULT NULL,
  `balance` float NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `api_token`
--
ALTER TABLE `api_token`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deposit`
--
ALTER TABLE `deposit`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `deposit_id` (`deposit_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `api_token`
--
ALTER TABLE `api_token`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `deposit`
--
ALTER TABLE `deposit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
