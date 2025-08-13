# Provider Portal - Health First

A comprehensive React-based provider portal for healthcare professionals in the Health First system.

## Features

- **Dashboard**: Analytics, statistics, and overview of daily operations
- **Patient Management**: View and manage patient information
- **Appointments**: Schedule and manage patient appointments
- **Schedule**: Weekly schedule management and time slot allocation
- **Profile**: Provider profile and professional information
- **Analytics**: Charts and reports for practice insights

## Tech Stack

- **React 18**: Latest version with modern features
- **Material-UI (MUI)**: Professional UI components
- **React Router**: Client-side routing
- **Vite**: Fast build tool and development server
- **Recharts**: Data visualization and charts
- **Axios**: HTTP client for API calls
- **React Query**: Data fetching and caching

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Navigate to the provider portal directory:
   ```bash
   cd provider-portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:3001`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   └── Layout/
│       └── Layout.jsx          # Main layout with navigation
├── pages/
│   ├── Auth/
│   │   └── Login.jsx           # Provider login
│   ├── Dashboard/
│   │   └── Dashboard.jsx       # Analytics dashboard
│   ├── Patients/
│   │   └── Patients.jsx        # Patient management
│   ├── Appointments/
│   │   └── Appointments.jsx    # Appointment management
│   ├── Schedule/
│   │   └── Schedule.jsx        # Weekly schedule
│   └── Profile/
│       └── Profile.jsx         # Provider profile
├── App.jsx                     # Main app component
└── main.jsx                    # Entry point
```

## Features Overview

### Dashboard
- Practice analytics and metrics
- Revenue tracking
- Patient statistics
- Appointment overview
- Interactive charts and graphs

### Patient Management
- Patient search and filtering
- Patient details and medical history
- Add new patients
- Edit patient information

### Appointments
- View all appointments
- Schedule new appointments
- Edit appointment details
- Status management (Confirmed, Pending, Cancelled)

### Schedule
- Weekly schedule view
- Time slot management
- Add available time slots
- Appointment scheduling

### Profile
- Professional information
- Certifications and credentials
- Practice details
- Recent patient list

## Development

### Adding New Features

1. Create new components in the appropriate directory
2. Add routes in `App.jsx`
3. Update navigation in `Layout.jsx`
4. Follow the existing code patterns and styling

### Styling

The project uses Material-UI (MUI) with a custom theme optimized for healthcare professionals. The color scheme uses green as the primary color to represent health and wellness.

### Data Visualization

The dashboard uses Recharts for data visualization. Charts include:
- Bar charts for weekly statistics
- Line charts for revenue trends
- Responsive design for all screen sizes

### State Management

Currently using React's built-in state management. For larger applications, consider adding Redux Toolkit or Zustand.

## API Integration

The portal is designed to integrate with a backend API. Key endpoints to implement:

- `/api/providers/login` - Provider authentication
- `/api/patients` - Patient management
- `/api/appointments` - Appointment management
- `/api/schedule` - Schedule management
- `/api/analytics` - Dashboard analytics

## Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=Health First Provider Portal
VITE_PROVIDER_ID=your-provider-id
```

## Security Considerations

- Implement proper authentication and authorization
- Secure API endpoints
- Data encryption for sensitive patient information
- HIPAA compliance measures
- Regular security audits

## Performance Optimization

- Lazy loading for routes
- Optimized bundle size
- Efficient data fetching with React Query
- Responsive images and assets
- Caching strategies

## Contributing

1. Follow the existing code style
2. Add appropriate comments for complex logic
3. Test your changes thoroughly
4. Update documentation as needed
5. Ensure HIPAA compliance for any patient data handling

## License

This project is part of the Health First healthcare system and is subject to healthcare data protection regulations. 