# Cloud Sentinel Frontend

Next.js frontend application for Cloud Sentinel - Cloud Cost Monitoring Platform.

## Features

### Authentication
- **Split-screen design** with professional branding
- Login and registration pages with JWT token management
- Automatic redirection for authenticated users
- Error handling with inline feedback

### Dashboard
- **Sidebar Navigation**: Collapsible menu with icons (Overview, Resources, Billing, Settings)
- **Top Bar**:
  - Cloud account selector dropdown
  - "Add Account" button with modal
  - "Scan" action button
  - System status indicator
  - User info and logout button

### KPI Cards
- Current cost (Month-to-Date)
- End-of-month forecast
- Active resources count
- Health score with trends

### Data Visualization
- **Cost by Service Chart**: Bar chart showing cost breakdown by AWS service
- **Region Distribution Chart**: Pie chart showing resource distribution by region

### Resources Table
- Sortable columns (Name, Service, Cost/h, Cost MTD)
- Status badges (Running, Stopped, Available)
- Hover effects and responsive design
- Mock data for demonstration

### Account Management
- **Add Account Modal** with:
  - Provider selection (AWS, Azure, GCP)
  - Access key and secret key inputs
  - Secret key visibility toggle
  - Connection test before saving
  - Visual feedback (loading states, success/error messages)
  - Security recommendations

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Docker

```bash
# Build and run with docker-compose (from project root)
docker-compose up frontend

# Or build standalone
docker build -t cloud-sentinel-frontend .
docker run -p 3000:3000 cloud-sentinel-frontend
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/v1
```

## Project Structure

```
frontend/
├── app/                      # Next.js app directory
│   ├── auth/                # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/           # Dashboard pages
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page (redirects to login)
├── components/
│   ├── auth/                # Auth components
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── dashboard/           # Dashboard components
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   ├── kpi-card.tsx
│   │   ├── cost-chart.tsx
│   │   ├── region-chart.tsx
│   │   ├── resources-table.tsx
│   │   └── add-account-dialog.tsx
│   └── ui/                  # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── dialog.tsx
│       ├── select.tsx
│       └── badge.tsx
├── lib/
│   ├── api.ts               # API client with all endpoints
│   ├── store.ts             # Zustand state management
│   └── utils.ts             # Utility functions
├── types/
│   └── index.ts             # TypeScript type definitions
└── public/                  # Static assets
```

## API Integration

The frontend integrates with the Cloud Sentinel backend API:

### Authentication
- `POST /v1/auth/login` - User login
- `POST /v1/auth/register` - User registration

### User
- `GET /v1/user/get_user` - Get current user info

### Accounts
- `POST /v1/account/` - Add cloud account
- `GET /v1/account/` - List all accounts
- `GET /v1/account/{id}/resources` - Get resources for account
- `GET /v1/account/{id}/test_connection` - Test connection
- `DELETE /v1/account/{id}` - Delete account

### Scans
- `POST /v1/scan/{account_id}/scan-{region}` - Start scan
- `GET /v1/scan/task/{task_id}` - Get scan status

## Design Philosophy

### Professional & Modern
- Clean, minimal design with professional color scheme
- Gradient backgrounds for authentication pages
- Smooth transitions and hover effects
- Responsive layout for all screen sizes

### Security First
- JWT token storage in localStorage
- Automatic token refresh and error handling
- Secret key masking with visibility toggle
- Read-only access recommendations

### User Experience
- Loading states for all async operations
- Inline error messages (no aggressive popups)
- Visual feedback for all actions
- Sortable and filterable data tables
- Collapsible sidebar for more workspace

## Future Enhancements

- Real-time data updates with WebSocket
- Advanced filtering and search
- Cost optimization recommendations
- Multi-region scan support
- Export data to CSV/PDF
- Dark mode toggle
- Email notifications
- Budget alerts
