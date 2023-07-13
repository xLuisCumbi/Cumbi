# Cumbi Crypto Gateway API

A brief description of your project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [API Documentation](#documentation)

## Prerequisites

Before you begin, ensure that you have the following prerequisites installed on your machine:

- Nodejs
- nodemon
- Xamp
- Postman

## Installation

1. Clone the repository to your local machine using
2. Start your local xamp server
3. Create a new database "cumbi-crypto-api.sql"
4. Import the database file in /config/cumbi-crypto-api.sql
5. Run nodemon start

## Documentation

# API Documentation

## Introduction

This API provides endpoints to interact with the Cumbi Crypto API. 
It allows users to create new deposit objects and retrieve existing deposit information on ETH AND TRON network

## Base URL

http://localhost:3000/api


## Authentication

To authenticate API requests, include the `Authorization` header with the `Bearer` token.

## Create a New Deposit

Create a new deposit object by sending a POST request to the `/deposit/create` endpoint.

### Request

- Method: POST
- URL: `/deposit/create`
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer \<token\>

#### Request Body

```json
{
    "deposit_id": "test1",
    "amount" : 10,
    "network": "ethereum",
    "coin": "usdt"
}

```

<table>
<!-- add readme api documentation ✨✨ -->
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>deposit_id</td>
      <td>string</td>
      <td>yes</td>
      <td>deposit unique id to attached to this deposit</td>
    </tr>
    <tr>
      <td>amount</td>
      <td>number(double)</td>
      <td>yes</td>
      <td>deposit amount in USD</td>
    </tr>
     <tr>
      <td>network</td>
      <td>string</td>
      <td>yes</td>
      <td>the crypto network you wont to interact with supported: ethereum || tron </td>
    </tr>
     <tr>
      <td>network</td>
      <td>string</td>
      <td>yes</td>
      <td>the crypto network you want to interact with supported: ethereum || tron </td>
    </tr>
      <tr>
      <td>coin</td>
      <td>string</td>
      <td>yes</td>
      <td>the crypto coin you want to interact with on the selected network supported: USDT || USDC</td>
    </tr>
  </tbody>
</table>

#### Request Response

```json
{
    "status": "success",
    "depositObj": {
        "address": "...address", //the deposit address
        "coin_price": "1.00",
        "deposit_id": "test1",
        "balance": 0, //the address balance
        "amount_usd": 8,
        "status": "pending", //`pending || success` : when the balance  >= amount
        "amount": 8,
        "coin": "USDT",
        "network": "ETHEREUM"
    }
}

```