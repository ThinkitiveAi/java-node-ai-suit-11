# Patient Portal - Health First

A modern React-based patient portal for the Health First healthcare system.

## Features

- **Dashboard**: Overview of appointments, medications, and health metrics
- **Appointments**: Book, view, and manage appointments
- **Profile**: View and edit personal and medical information
- **Authentication**: Secure login and registration system
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **React 18**: Latest version with modern features
- **Material-UI (MUI)**: Professional UI components
- **React Router**: Client-side routing
- **Vite**: Fast build tool and development server
- **Axios**: HTTP client for API calls
- **React Query**: Data fetching and caching

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Navigate to the patient portal directory:
   ```bash
   cd patient-portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:3000`

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
│   │   ├── Login.jsx           # Login page
│   │   └── Register.jsx        # Registration page
│   ├── Dashboard/
│   │   └── Dashboard.jsx       # Main dashboard
│   ├── Appointments/
│   │   └── Appointments.jsx    # Appointment management
│   └── Profile/
│       └── Profile.jsx         # User profile
├── App.jsx                     # Main app component
└── main.jsx                    # Entry point
```

## Features Overview

### Dashboard
- Health metrics overview
- Upcoming appointments
- Recent medications
- Quick access to key features

### Appointments
- View all appointments
- Book new appointments
- Reschedule or cancel appointments
- Filter by status and date

### Profile
- Personal information management
- Medical history
- Emergency contacts
- Edit profile information

## Development

### Adding New Features

1. Create new components in the appropriate directory
2. Add routes in `App.jsx`
3. Update navigation in `Layout.jsx`
4. Follow the existing code patterns and styling

### Styling

The project uses Material-UI (MUI) for consistent styling. Custom styles can be added using the `sx` prop or styled components.

### State Management

Currently using React's built-in state management. For larger applications, consider adding Redux Toolkit or Zustand.

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
VITE_APP_NAME=Health First Patient Portal
```

## Contributing

1. Follow the existing code style
2. Add appropriate comments for complex logic
3. Test your changes thoroughly
4. Update documentation as needed

## License

This project is part of the Health First healthcare system. 