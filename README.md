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
      <td>amount</td>
      <td>number</td>
      <td>yes</td>
      <td>The deposit amount.</td>
    </tr>
    <tr>
      <td>currency</td>
      <td>string</td>
      <td>yes</td>
      <td>The currency of the deposit.</td>
    </tr>
  </tbody>
</table>