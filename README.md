# TableCRM Mobile

Mobile order management system for TableCRM.

## Features

- Token-based authorization
- Client search by phone number
- Account, Organization, Warehouse, and Price Type selection
- Product search and order item management
- Create and conduct sales orders
- Mobile-optimized interface

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install --force
   ```
3. Run development server:
   ```bash
   npm run dev
   ```

## Build

```bash
npm run build
```

## Deployment to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow the prompts to complete deployment

## API Token

To use the application, you need a valid TableCRM API token. You can use the test token provided:
```
af1874616430e04cfd4bce30035789907e899fc7c3a1a4bb27254828ff304a77
```

## Technologies

- React 19 with TypeScript
- Vite
- Tailwind CSS
- Axios for API calls
- Mobile-first responsive design