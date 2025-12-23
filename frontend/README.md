# Cloud Sentinel Frontend

Modern Next.js frontend for the Cloud Sentinel Multi-Cloud FinOps platform.

## Features

- **Authentication**: Login and Register pages with JWT token management
- **Dashboard**: Real-time cloud resource monitoring with interactive charts
- **Multi-Cloud Support**: Manage AWS, Azure, and GCP accounts
- **FinOps Analytics**:
  - Month-to-Date (MTD) cost tracking
  - End-of-month forecast
  - Resource-level cost breakdown
  - Cost distribution charts
- **Resource Management**: View and manage cloud resources across all connected accounts
- **Regional Scanning**: Trigger scans for specific cloud regions

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Components**: Tremor (built on React and Tailwind CSS)
- **Charts**: Recharts (via Tremor)
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your backend API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── dashboard/
│   │   ├── components/
│   │   │   └── AddAccountModal.tsx  # Add cloud account form
│   │   ├── layout.tsx               # Dashboard layout with nav
│   │   └── page.tsx                 # Main dashboard page
│   ├── login/
│   │   └── page.tsx                 # Login page
│   ├── register/
│   │   └── page.tsx                 # Registration page
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Home page (redirects)
├── lib/
│   ├── api.ts                       # API client and endpoints
│   ├── types.ts                     # TypeScript types
│   └── process-resources.ts         # Resource data processing
└── public/                          # Static assets
```

## Pages

### Login (`/login`)
- Email and password authentication
- Token storage in localStorage
- Redirects to dashboard on success

### Register (`/register`)
- User registration with:
  - Email
  - Password (minimum 8 characters)
  - First name
  - Last name
  - Company name
- Auto-login after registration

### Dashboard (`/dashboard`)
- Account selector
- Regional scan launcher
- Key metrics:
  - Month-to-Date cost
  - End-of-month forecast
  - Total resources count
- Charts:
  - Resources by type (bar chart)
  - Cost distribution (donut chart)
- Detailed resource table with:
  - Resource type
  - Name/ID
  - Instance type
  - Status
  - Region
  - Size (for S3)
  - Hourly price
  - MTD cost
  - Monthly forecast

### Add Cloud Account Modal
- Support for AWS, Azure, and GCP
- Fields:
  - Account name
  - Provider selection
  - Access key / Client ID
  - Secret key / Client secret
  - Tenant ID (optional, for Azure/GCP)
- AES-256 encryption notice

## API Integration

The frontend integrates with the following backend endpoints:

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /account/` - List cloud accounts
- `POST /account/` - Add cloud account
- `DELETE /account/{id}` - Delete cloud account
- `GET /account/{id}/resources` - Get account resources
- `GET /account/{id}/test_connection` - Test cloud credentials
- `POST /scan/{id}/scan-{region}` - Trigger regional scan
- `GET /user/get_user` - Get current user info

## Security

- JWT tokens stored in localStorage
- Automatic token injection in API requests
- Auto-redirect to login on 401 responses
- Credentials encrypted on backend using AES-256

## Cost Calculation

The frontend processes raw resource data and calculates:

1. **Hourly Price**: Based on instance type from pricing catalog
2. **Monthly Forecast**: Hourly price × 730 hours (for running instances) or GB × storage price (for S3)
3. **MTD Cost**: Prorated cost from start of month or resource launch time

Supports:
- EC2 instances (various types)
- RDS databases
- S3 buckets (storage-based pricing)

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: `http://localhost:8000/api/v1`)

## Development Notes

- Uses React 19 with Tremor (which expects React 18) via `--legacy-peer-deps`
- All pages use 'use client' directive for client-side rendering
- Authentication state managed via localStorage
- Protected routes check for token presence

## License

MIT
