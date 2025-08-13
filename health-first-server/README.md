# Health First Server - Provider Availability Module

A comprehensive healthcare provider availability management system with advanced timezone handling, recurring slot generation, and patient search functionality.

## 🚀 Features

- **Provider Availability Management**: Create, update, and delete availability slots
- **Recurring Slots**: Support for daily, weekly, and monthly recurring availability
- **Timezone Handling**: Automatic UTC conversion and local time display
- **Conflict Prevention**: Prevents overlapping time slots for the same provider
- **Patient Search**: Advanced search functionality for available slots
- **Appointment Booking**: Book and cancel appointment slots
- **Statistics & Analytics**: Comprehensive availability statistics

## 🏗️ Architecture

```
├── models/
│   ├── ProviderAvailability.js    # Main availability model
│   ├── AppointmentSlot.js         # Individual appointment slots
│   ├── Provider.js               # Provider information
│   └── Patient.js                # Patient information
├── routes/
│   ├── providerAvailabilityRoutes.js  # Provider availability endpoints
│   └── availabilitySearchRoutes.js    # Patient search endpoints
├── controllers/
│   └── providerAvailabilityController.js  # Business logic
├── services/
│   └── providerAvailabilityService.js     # Core business logic
├── repositories/
│   └── providerAvailabilityRepository.js  # Data access layer
├── utils/
│   └── timezoneUtils.js          # Timezone conversion utilities
└── tests/
    └── providerAvailability.test.js       # Comprehensive test suite
```

## 📋 API Endpoints

### Provider Availability Management

#### Create Availability
```http
POST /api/v1/provider/availability
Authorization: Bearer <provider_token>
Content-Type: application/json

{
  "date": "2024-12-15",
  "start_time": "09:00",
  "end_time": "17:00",
  "timezone": "America/New_York",
  "slot_duration": 30,
  "break_duration": 15,
  "is_recurring": true,
  "recurrence_pattern": "weekly",
  "recurrence_end_date": "2025-01-15",
  "appointment_type": "consultation",
  "location": {
    "type": "clinic",
    "address": "123 Medical Center Dr, New York, NY 10001",
    "room_number": "Room 205"
  },
  "pricing": {
    "base_fee": 150.00,
    "insurance_accepted": true,
    "currency": "USD"
  },
  "special_requirements": ["fasting_required", "bring_insurance_card"],
  "notes": "Standard consultation slots"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Availability slots created successfully",
  "data": {
    "availability_id": "uuid-here",
    "slots_created": 32,
    "date_range": {
      "start": "2024-12-15",
      "end": "2025-01-15"
    },
    "total_appointments_available": 224
  }
}
```

#### Get Provider Availability
```http
GET /api/v1/provider/:provider_id/availability?start_date=2024-12-15&end_date=2024-12-20&status=available&appointment_type=consultation&timezone=America/New_York
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "provider_id": "uuid-here",
    "availability_summary": {
      "total_slots": 48,
      "available_slots": 32,
      "booked_slots": 14,
      "cancelled_slots": 2
    },
    "availability": [
      {
        "date": "2024-12-15",
        "slots": [
          {
            "slot_id": "uuid-here",
            "start_time": "09:00",
            "end_time": "09:30",
            "status": "available",
            "appointment_type": "consultation",
            "location": {
              "type": "clinic",
              "address": "123 Medical Center Dr",
              "room_number": "Room 205"
            },
            "pricing": {
              "base_fee": 150.00,
              "insurance_accepted": true
            }
          }
        ]
      }
    ]
  }
}
```

#### Update Availability
```http
PUT /api/v1/provider/availability/:slot_id
Authorization: Bearer <provider_token>
Content-Type: application/json

{
  "start_time": "10:00",
  "end_time": "10:30",
  "status": "available",
  "notes": "Updated consultation time",
  "pricing": {
    "base_fee": 175.00
  }
}
```

#### Delete Availability
```http
DELETE /api/v1/provider/availability/:slot_id?delete_recurring=true&reason=Holiday
Authorization: Bearer <provider_token>
```

### Patient Search & Booking

#### Search Available Slots
```http
GET /api/v1/availability/search?date=2024-12-15&specialization=cardiology&location=New York&appointment_type=consultation&insurance_accepted=true&max_price=200&timezone=America/New_York&available_only=true
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "search_criteria": {
      "date": "2024-12-15",
      "specialization": "cardiology",
      "location": "New York"
    },
    "total_results": 15,
    "results": [
      {
        "provider": {
          "id": "uuid-here",
          "name": "Dr. John Doe",
          "specialization": "Cardiology",
          "years_of_experience": 15,
          "rating": 4.8,
          "clinic_address": "123 Medical Center Dr, New York, NY"
        },
        "available_slots": [
          {
            "slot_id": "uuid-here",
            "date": "2024-12-15",
            "start_time": "10:00",
            "end_time": "10:30",
            "appointment_type": "consultation",
            "location": {
              "type": "clinic",
              "address": "123 Medical Center Dr",
              "room_number": "Room 205"
            },
            "pricing": {
              "base_fee": 150.00,
              "insurance_accepted": true,
              "currency": "USD"
            },
            "special_requirements": ["bring_insurance_card"]
          }
        ]
      }
    ]
  }
}
```

#### Book Appointment Slot
```http
POST /api/v1/availability/:slot_id/book
Content-Type: application/json

{
  "patient_id": "uuid-here",
  "notes": "Patient prefers morning appointments"
}
```

#### Cancel Appointment
```http
POST /api/v1/availability/:slot_id/cancel
Content-Type: application/json

{
  "reason": "Patient requested cancellation"
}
```

#### Check Slot Availability
```http
GET /api/v1/availability/:slot_id/check
```

## 🕐 Timezone Handling

The system automatically handles timezone conversions:

- **Storage**: All times are stored in UTC in the database
- **Display**: Times are converted to the provider's local timezone for display
- **Validation**: Supports major timezones including DST transitions
- **Conversion**: Automatic local-to-UTC and UTC-to-local conversion

### Supported Timezones
- `America/New_York` (EST/EDT)
- `America/Chicago` (CST/CDT)
- `America/Denver` (MST/MDT)
- `America/Los_Angeles` (PST/PDT)
- `Europe/London` (GMT/BST)
- `Europe/Paris` (CET/CEST)
- `Asia/Tokyo` (JST)
- `Asia/Shanghai` (CST)
- `Asia/Kolkata` (IST)
- `Australia/Sydney` (AEST/AEDT)
- `UTC`

## 🔄 Recurring Availability

### Patterns
- **Daily**: Creates slots for every day
- **Weekly**: Creates slots for the same day each week
- **Monthly**: Creates slots for the same date each month

### Example
```json
{
  "is_recurring": true,
  "recurrence_pattern": "weekly",
  "recurrence_end_date": "2025-01-15",
  "slot_duration": 30,
  "break_duration": 15
}
```

## 🛡️ Conflict Prevention

The system automatically prevents:
- Overlapping time slots for the same provider
- Double-booking of appointment slots
- Deletion of slots with existing appointments
- Invalid time ranges (end_time ≤ start_time)

## 📊 Statistics & Analytics

### Provider Statistics
```http
GET /api/v1/provider/availability/:provider_id/statistics?start_date=2024-12-01&end_date=2024-12-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSlots": 120,
    "availableSlots": 85,
    "bookedSlots": 30,
    "totalAppointments": 35,
    "totalRevenue": 5250.00
  }
}
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test tests/providerAvailability.test.js
```

### Test Coverage
- ✅ Availability creation (single & recurring)
- ✅ Timezone handling and UTC conversion
- ✅ Conflict detection and prevention
- ✅ Patient search functionality
- ✅ Appointment booking and cancellation
- ✅ Route conflict resolution
- ✅ Input validation and sanitization

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.0.0
- MongoDB
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Set environment variables
cp env.example .env

# Start the server
npm start

# Development mode
npm run dev
```

### Environment Variables
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/health_first
JWT_SECRET=your-secret-key
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## 📝 API Documentation

- **Health Check**: `GET /health`
- **Provider Availability**: `http://localhost:3000/api/v1/provider/availability`
- **Patient Search**: `http://localhost:3000/api/v1/availability/search`

## 🔧 Troubleshooting

### Common Issues

1. **Route Conflict Error**: Fixed by reordering routes in `providerRoutes.js`
2. **Timezone Validation**: Ensure timezone is in the supported list
3. **MongoDB Connection**: Check database connection string and network access

### Error Codes
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `409`: Conflict (time slot conflicts, booking issues)
- `500`: Internal Server Error (database/server issues)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the test files for usage examples 