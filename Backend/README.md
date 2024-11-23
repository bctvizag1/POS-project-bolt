# POS Backend API

A Node.js backend API for a Point of Sale system using Express, MS SQL Server, and Knex.

## Prerequisites

- Node.js (v14 or higher)
- MS SQL Server
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pos-backend
```

2. Install dependencies:
```bash
npm install express dotenv knex mssql @types/express typescript ts-node
```

3. Create a `.env` file in the root directory with your database configuration:
```env
DB_SERVER=your_server_name
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
PORT=3000
```

4. Build and start the server:
```bash
npm run build
npm start
```

## API Endpoints

- `GET /api/products` - Get all available products
- `POST /api/sales` - Create a new sale
- `GET /api/daily-sales` - Get daily sales summary
- `GET /api/transactions` - Get all transactions

## Development

To run the server in development mode with hot reloading:

```bash
npm run dev
```

## Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts"
  }
}
```

## Dependencies

- express: ^4.18.2
- dotenv: ^16.3.1
- knex: ^3.0.1
- mssql: ^10.0.1
- typescript: ^5.2.2
- @types/express: ^4.17.21
- ts-node-dev: ^2.0.0

## License

MIT