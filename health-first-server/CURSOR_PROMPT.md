# Express.js Provider Registration Backend - Cursor Prompt

## 🎯 Objective
Create a secure Express.js backend API for healthcare provider registration with comprehensive validation, authentication, and database support.

## 📋 Requirements Overview
- Provider registration with secure authentication
- Comprehensive input validation and sanitization
- Support for both MySQL and PostgreSQL databases
- Password hashing with bcrypt (12 salt rounds)
- Rate limiting and security headers
- Comprehensive error handling
- Unit testing with Jest

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
│   ├── setup.js             # Test configuration
│   └── provider.test.js     # Unit tests
├── utils/
│   └── errors.js            # Custom error classes
├── server.js                # Express server setup
├── package.json
├── jest.config.js
├── env.example
└── README.md
```

## 🚀 Implementation Steps

### Step 1: Initialize Project
```bash
npm init -y
npm install express bcryptjs joi cors helmet express-rate-limit express-validator uuid dotenv
npm install --save-dev nodemon jest supertest
```

### Step 2: Database Schema
Create a `providers` table with the following structure:

**MySQL:**
```sql
CREATE TABLE providers (
  id VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  license_number VARCHAR(20) UNIQUE NOT NULL,
  years_of_experience INT NOT NULL,
  clinic_address JSON NOT NULL,
  verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_phone (phone_number),
  INDEX idx_license (license_number),
  INDEX idx_status (verification_status),
  INDEX idx_created (created_at)
);
```

**PostgreSQL:**
```sql
CREATE TABLE providers (
  id UUID PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  license_number VARCHAR(20) UNIQUE NOT NULL,
  years_of_experience INTEGER NOT NULL,
  clinic_address JSONB NOT NULL,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 3: Validation Schema (Joi)
Create comprehensive validation for:
- **Names**: 2-50 characters, letters and spaces only
- **Email**: Valid email format, lowercase
- **Phone**: International format (+1234567890)
- **Password**: 8+ chars, uppercase, lowercase, number, special char
- **License**: 5-20 chars, alphanumeric, uppercase
- **Experience**: 0-50 years
- **Address**: Complete address object with validation

### Step 4: Security Implementation
- **Password Hashing**: bcrypt with 12 salt rounds
- **Input Sanitization**: Escape and trim all inputs
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable allowed origins
- **Helmet**: Security headers
- **Validation**: Comprehensive input validation

### Step 5: API Endpoints
Implement these Express routes:

1. **POST /api/v1/provider/register**
   - Validate all required fields
   - Check for duplicates (email, phone, license)
   - Hash password
   - Save to database
   - Return success response

2. **GET /api/v1/provider/:id**
   - Retrieve provider by ID
   - Return sanitized data (no password)

3. **GET /api/v1/provider**
   - List providers with pagination
   - Filter by verification status

4. **PATCH /api/v1/provider/:id/verify**
   - Update verification status
   - Validate status values

### Step 6: Error Handling
Create custom error classes:
- `ValidationError` (400)
- `DuplicateError` (409)
- `DatabaseError` (500)
- `AuthenticationError` (401)
- `AuthorizationError` (403)
- `NotFoundError` (404)
- `RateLimitError` (429)

### Step 7: Testing
Create comprehensive tests for:
- Valid provider registration
- Validation error scenarios
- Duplicate detection
- Password hashing
- API endpoint testing
- Error handling

## 🔧 Key Implementation Details

### Environment Variables
```env
PORT=3000
NODE_ENV=development
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=health_first
DB_USER=root
DB_PASSWORD=
ALLOWED_ORIGINS=http://localhost:3000
```

### Request Body Example
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

### Success Response
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

### Error Response
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

## 🧪 Testing Commands
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run dev           # Development server
npm start             # Production server
```

## 🔐 Security Checklist
- [ ] Password hashing with bcrypt (12 rounds)
- [ ] Input sanitization and validation
- [ ] Rate limiting implementation
- [ ] CORS configuration
- [ ] Security headers (Helmet)
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Error message sanitization
- [ ] Duplicate entry handling
- [ ] Comprehensive validation

## 📝 Validation Rules
- **Email**: Unique, valid format, lowercase
- **Phone**: Unique, international format
- **Password**: 8+ chars, uppercase, lowercase, number, special char
- **License**: Unique, alphanumeric, uppercase
- **Names**: 2-50 chars, letters and spaces only
- **Address**: Complete address with ZIP validation
- **Experience**: 0-50 years, integer

## 🚨 Error Handling
- Return appropriate HTTP status codes
- Provide detailed validation error messages
- Handle database-specific errors
- Sanitize error responses in production
- Log errors for debugging

## 🎯 Success Criteria
- [ ] Provider registration works with valid data
- [ ] All validation rules are enforced
- [ ] Duplicate entries are properly handled
- [ ] Passwords are securely hashed
- [ ] API returns proper status codes
- [ ] Tests pass with 80%+ coverage
- [ ] Security measures are implemented
- [ ] Database operations work correctly
- [ ] Error handling is comprehensive
- [ ] Documentation is complete

## 💡 Best Practices
- Use async/await for database operations
- Implement proper error boundaries
- Sanitize all user inputs
- Use environment variables for configuration
- Implement comprehensive logging
- Follow RESTful API conventions
- Use middleware for common functionality
- Implement proper separation of concerns
- Write meaningful test cases
- Document API endpoints thoroughly 