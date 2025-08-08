# Health First Server - Provider Registration API

A secure and comprehensive Express.js backend API for healthcare provider registration with robust validation, authentication, and database support.

## 🚀 Features

- **Secure Provider Registration** with comprehensive validation
- **Multi-Database Support** (MySQL & PostgreSQL)
- **Password Security** with bcrypt hashing (12 salt rounds)
- **Input Sanitization** to prevent injection attacks
- **Rate Limiting** for API protection
- **Comprehensive Error Handling** with custom error classes
- **Unit Testing** with Jest and Supertest
- **Health Check Endpoints**
- **CORS Configuration** for cross-origin requests

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL or PostgreSQL database
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd health-first-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your database credentials:
   ```env
   # Database Configuration
   DB_TYPE=mysql  # or postgresql
   DB_HOST=localhost
   DB_PORT=3306   # 5432 for PostgreSQL
   DB_NAME=health_first
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```

4. **Database Setup**
   - Create a database named `health_first`
   - Tables will be automatically created on first run

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Running Tests
```bash
npm test
```

### Watch Mode for Tests
```bash
npm run test:watch
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Health First Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Provider Registration

#### Register New Provider
```http
POST /provider/register
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@clinic.com",
  "phone_number": "+1234567890",
  "password": "SecurePassword123!",
  "confirm_password": "SecurePassword123!",
  "specialization": "Cardiology",
  "license_number": "MD123456789",
  "years_of_experience": 10,
  "clinic_address": {
    "street": "123 Medical Center Dr",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Provider registered successfully. Verification email sent.",
  "data": {
    "provider_id": "uuid-here",
    "email": "john.doe@clinic.com",
    "verification_status": "pending"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

#### Get Provider by ID
```http
GET /provider/:id
```

#### Get All Providers (with pagination)
```http
GET /provider?page=1&limit=10&status=pending
```

#### Update Provider Verification Status
```http
PATCH /provider/:id/verify
```

**Request Body:**
```json
{
  "status": "verified"
}
```

## 🔒 Validation Rules

### Required Fields
- `first_name` (2-50 characters, letters and spaces only)
- `last_name` (2-50 characters, letters and spaces only)
- `email` (valid email format, unique)
- `phone_number` (international format: +1234567890, unique)
- `password` (8+ characters, uppercase, lowercase, number, special character)
- `confirm_password` (must match password)
- `specialization` (3-100 characters)
- `license_number` (5-20 characters, alphanumeric, unique)
- `years_of_experience` (0-50 years)
- `clinic_address` (complete address object)

### Address Validation
- `street` (max 200 characters)
- `city` (max 100 characters, letters and spaces only)
- `state` (max 50 characters, letters and spaces only)
- `zip` (valid US ZIP format: 12345 or 12345-6789)

## 🏗️ Project Structure

```
health-first-server/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   └── providerController.js # Request handling
├── middleware/
│   └── errorHandler.js      # Global error handling
├── models/
│   └── Provider.js          # Data model and validation
├── repositories/
│   └── providerRepository.js # Database operations
├── routes/
│   └── providerRoutes.js    # API routes
├── services/
│   └── providerService.js   # Business logic
├── tests/
│   └── provider.test.js     # Unit tests
├── utils/
│   └── errors.js            # Custom error classes
├── server.js                # Express server setup
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `DB_TYPE` | Database type (mysql/postgresql) | mysql |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 3306/5432 |
| `DB_NAME` | Database name | health_first |
| `DB_USER` | Database user | root/postgres |
| `DB_PASSWORD` | Database password | - |
| `ALLOWED_ORIGINS` | CORS origins | http://localhost:3000 |

## 🧪 Testing

The application includes comprehensive unit tests covering:

- Provider registration with valid data
- Validation error handling
- Duplicate email/phone/license detection
- Password hashing and verification
- Model validation
- API endpoint testing

Run tests:
```bash
npm test
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **Input Sanitization**: Prevents injection attacks
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable allowed origins
- **Helmet**: Security headers
- **Validation**: Comprehensive input validation
- **Error Handling**: Secure error responses

## 🚨 Error Handling

The API uses custom error classes for better error categorization:

- `ValidationError` (400) - Input validation failures
- `DuplicateError` (409) - Duplicate entries
- `DatabaseError` (500) - Database operation failures
- `AuthenticationError` (401) - Authentication failures
- `AuthorizationError` (403) - Authorization failures
- `NotFoundError` (404) - Resource not found
- `RateLimitError` (429) - Rate limit exceeded

## 📝 Database Schema

### Providers Table

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | VARCHAR(36)/UUID | PRIMARY KEY |
| `first_name` | VARCHAR(50) | NOT NULL |
| `last_name` | VARCHAR(50) | NOT NULL |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL |
| `phone_number` | VARCHAR(20) | UNIQUE, NOT NULL |
| `password_hash` | VARCHAR(255) | NOT NULL |
| `specialization` | VARCHAR(100) | NOT NULL |
| `license_number` | VARCHAR(20) | UNIQUE, NOT NULL |
| `years_of_experience` | INT | NOT NULL |
| `clinic_address` | JSON/JSONB | NOT NULL |
| `verification_status` | ENUM/VARCHAR | DEFAULT 'pending' |
| `is_active` | BOOLEAN | DEFAULT TRUE |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository. 