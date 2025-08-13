# Health First - Healthcare Management System

A comprehensive healthcare management system with separate portals for patients and healthcare providers.

## Overview

Health First is a modern healthcare management system built with React and Material-UI. It consists of two main portals:

- **Patient Portal**: For patients to manage appointments, view medical records, and interact with healthcare providers
- **Provider Portal**: For healthcare professionals to manage patients, appointments, and practice analytics

## Project Structure

```
health-first-client/
├── patient-portal/          # Patient-facing application
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── provider-portal/         # Provider-facing application
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
└── README.md               # This file
```

## Quick Start

### Patient Portal

```bash
cd patient-portal
npm install
npm run dev
```

Visit: http://localhost:3000

### Provider Portal

```bash
cd provider-portal
npm install
npm run dev
```

Visit: http://localhost:3001

## Features

### Patient Portal Features
- 📊 **Dashboard**: Health metrics and appointment overview
- 📅 **Appointments**: Book, view, and manage appointments
- 👤 **Profile**: Personal and medical information management
- 🔐 **Authentication**: Secure login and registration
- 📱 **Responsive Design**: Works on all devices

### Provider Portal Features
- 📈 **Analytics Dashboard**: Practice metrics and revenue tracking
- 👥 **Patient Management**: Comprehensive patient database
- 📅 **Appointment Management**: Schedule and manage appointments
- 📋 **Schedule Management**: Weekly schedule and time slots
- 👨‍⚕️ **Provider Profile**: Professional information and credentials
- 📊 **Charts & Reports**: Data visualization with Recharts

## Technology Stack

### Frontend
- **React 18**: Modern React with latest features
- **Material-UI (MUI)**: Professional UI components
- **React Router**: Client-side routing
- **Vite**: Fast build tool and development server
- **Recharts**: Data visualization (Provider Portal)
- **Axios**: HTTP client for API calls
- **React Query**: Data fetching and caching

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Type safety (optional)
- **Git**: Version control

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd health-first-client
   ```

2. Install dependencies for both portals:
   ```bash
   # Patient Portal
   cd patient-portal
   npm install
   
   # Provider Portal
   cd ../provider-portal
   npm install
   ```

3. Start both development servers:
   ```bash
   # Terminal 1 - Patient Portal
   cd patient-portal
   npm run dev
   
   # Terminal 2 - Provider Portal
   cd provider-portal
   npm run dev
   ```

4. Access the applications:
   - Patient Portal: http://localhost:3000
   - Provider Portal: http://localhost:3001

## Development

### Code Structure

Both portals follow a similar structure:
- `src/components/` - Reusable UI components
- `src/pages/` - Page components
- `src/App.jsx` - Main application component
- `src/main.jsx` - Application entry point

### Styling

- Material-UI (MUI) for consistent design
- Custom themes for each portal
- Responsive design principles
- Accessibility considerations

### State Management

- React hooks for local state
- Context API for global state (if needed)
- React Query for server state

## API Integration

The portals are designed to work with a backend API. Key endpoints to implement:

### Patient Portal API
- `POST /api/patients/login` - Patient authentication
- `GET /api/patients/profile` - Patient profile
- `GET /api/appointments` - Patient appointments
- `POST /api/appointments` - Book appointment

### Provider Portal API
- `POST /api/providers/login` - Provider authentication
- `GET /api/patients` - Patient list
- `GET /api/appointments` - Appointment management
- `GET /api/analytics` - Dashboard analytics

## Security Considerations

- **Authentication**: Secure login systems
- **Authorization**: Role-based access control
- **Data Protection**: HIPAA compliance measures
- **Encryption**: Sensitive data encryption
- **Audit Logs**: Activity tracking

## Deployment

### Build for Production

```bash
# Patient Portal
cd patient-portal
npm run build

# Provider Portal
cd provider-portal
npm run build
```

### Environment Variables

Create `.env` files in each portal directory:

```env
VITE_API_URL=http://your-api-url
VITE_APP_NAME=Health First
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards

- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Ensure responsive design
- Test on multiple devices

## License

This project is part of the Health First healthcare system and is subject to healthcare data protection regulations.

## Support

For support and questions:
- Check the individual portal README files
- Review the documentation
- Contact the development team

---

**Health First** - Empowering healthcare through technology 