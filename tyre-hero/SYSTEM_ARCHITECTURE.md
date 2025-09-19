# Tyre Hero - Comprehensive System Architecture

## Executive Summary

This document outlines the complete system architecture for transforming Tyre Hero from a static website into a full-featured tyre service platform. The architecture focuses on scalability, security, and maintainability using modern web technologies and cloud-native approaches.

## Current State Analysis

**Existing Application:**
- React frontend with Vite build system
- Tailwind CSS v4 for styling
- Single-page static website
- No backend infrastructure
- No database or state management
- Static contact forms and service listings

**Transformation Requirements:**
- Full-stack web application with real-time capabilities
- Customer booking and payment processing
- Technician dispatch and tracking system
- Admin dashboard for operations management
- Mobile-responsive with PWA capabilities

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        TYRE HERO PLATFORM                      │
├─────────────────────────────────────────────────────────────────┤
│  Frontend Layer (React SPA)                                    │
│  ├── Customer App (Booking, Tracking, Payments)               │
│  ├── Technician App (Job Management, GPS Tracking)            │
│  └── Admin Dashboard (Operations, Analytics, Management)      │
├─────────────────────────────────────────────────────────────────┤
│  API Gateway / BFF Layer                                       │
│  ├── Authentication & Authorization                            │
│  ├── Rate Limiting & Security                                  │
│  └── Request Routing & Load Balancing                          │
├─────────────────────────────────────────────────────────────────┤
│  Microservices Layer                                           │
│  ├── User Service          ├── Booking Service                 │
│  ├── Payment Service       ├── Notification Service            │
│  ├── Tracking Service      ├── Inventory Service               │
│  └── File Service          └── Analytics Service               │
├─────────────────────────────────────────────────────────────────┤
│  Database Layer                                                │
│  ├── PostgreSQL (Primary)  ├── Redis (Cache/Sessions)         │
│  └── MongoDB (Files/Logs)  └── InfluxDB (Time-series data)    │
├─────────────────────────────────────────────────────────────────┤
│  External Services                                             │
│  ├── Stripe/PayPal (Payments)  ├── Twilio (SMS)               │
│  ├── SendGrid (Email)          ├── Google Maps (Location)     │
│  └── AWS S3 (File Storage)     └── Pusher (Real-time)         │
└─────────────────────────────────────────────────────────────────┘
```

## 1. Frontend Architecture

### Technology Stack
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite 7+
- **Styling:** Tailwind CSS v4
- **State Management:** Redux Toolkit + RTK Query
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation
- **Real-time:** Socket.io Client
- **Maps:** Google Maps React
- **UI Components:** Headless UI + Custom Design System

### Project Structure
```
src/
├── components/                 # Reusable UI components
│   ├── common/                 # Generic components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Loading/
│   │   └── ErrorBoundary/
│   ├── forms/                  # Form components
│   │   ├── BookingForm/
│   │   ├── ContactForm/
│   │   ├── PaymentForm/
│   │   └── LoginForm/
│   ├── layout/                 # Layout components
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Sidebar/
│   │   └── Navigation/
│   └── ui/                     # Design system components
│       ├── Card/
│       ├── Badge/
│       ├── Avatar/
│       └── Toast/
├── features/                   # Feature-based modules
│   ├── auth/                   # Authentication
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   ├── booking/                # Service booking
│   │   ├── components/
│   │   │   ├── BookingWizard/
│   │   │   ├── ServiceSelector/
│   │   │   ├── LocationPicker/
│   │   │   └── TimeSlotPicker/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   ├── tracking/               # Real-time tracking
│   │   ├── components/
│   │   │   ├── LiveMap/
│   │   │   ├── StatusUpdates/
│   │   │   └── ETADisplay/
│   │   ├── hooks/
│   │   └── services/
│   ├── payments/               # Payment processing
│   │   ├── components/
│   │   │   ├── PaymentMethods/
│   │   │   ├── CheckoutForm/
│   │   │   └── PaymentHistory/
│   │   ├── hooks/
│   │   └── services/
│   ├── dashboard/              # User/Admin dashboards
│   │   ├── customer/
│   │   ├── technician/
│   │   └── admin/
│   └── profile/                # User profiles
├── hooks/                      # Shared custom hooks
│   ├── useAuth.ts
│   ├── useGeolocation.ts
│   ├── useWebSocket.ts
│   └── useLocalStorage.ts
├── services/                   # API services
│   ├── api.ts                  # Axios configuration
│   ├── auth.service.ts
│   ├── booking.service.ts
│   ├── payment.service.ts
│   └── notification.service.ts
├── store/                      # Redux store
│   ├── index.ts
│   ├── authSlice.ts
│   ├── bookingSlice.ts
│   ├── uiSlice.ts
│   └── api/
│       ├── authApi.ts
│       ├── bookingApi.ts
│       └── paymentApi.ts
├── utils/                      # Utility functions
│   ├── constants.ts
│   ├── formatters.ts
│   ├── validators.ts
│   └── helpers.ts
├── types/                      # TypeScript definitions
│   ├── api.ts
│   ├── user.ts
│   ├── booking.ts
│   └── payment.ts
└── styles/                     # Global styles
    ├── globals.css
    ├── components.css
    └── utilities.css
```

### State Management Strategy

**Global State (Redux Toolkit):**
- User authentication and profile
- Current booking state
- UI state (modals, notifications)
- App configuration

**Server State (RTK Query):**
- API data caching
- Background synchronization
- Optimistic updates
- Error handling

**Local State (React):**
- Form inputs
- Component-specific UI state
- Temporary data

### Routing Architecture
```typescript
// Route Configuration
const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'services/:serviceId', element: <ServiceDetailPage /> },
      { path: 'booking', element: <BookingWizard /> },
      { path: 'booking/confirmation', element: <BookingConfirmation /> },
      { path: 'tracking/:bookingId', element: <TrackingPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'history', element: <BookingHistoryPage /> },
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ]
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    loader: adminLoader,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'bookings', element: <BookingManagement /> },
      { path: 'technicians', element: <TechnicianManagement /> },
      { path: 'customers', element: <CustomerManagement /> },
      { path: 'analytics', element: <AnalyticsPage /> },
    ]
  },
  {
    path: '/technician',
    element: <TechnicianLayout />,
    loader: technicianLoader,
    children: [
      { index: true, element: <TechnicianDashboard /> },
      { path: 'jobs', element: <JobManagement /> },
      { path: 'jobs/:jobId', element: <JobDetails /> },
    ]
  }
];
```

## 2. Backend API Architecture

### Technology Stack
- **Runtime:** Node.js 18+
- **Framework:** Express.js with TypeScript
- **Database ORM:** Prisma with PostgreSQL
- **Authentication:** JWT + Passport.js
- **Validation:** Zod
- **File Upload:** Multer + AWS S3
- **Real-time:** Socket.io
- **Testing:** Jest + Supertest
- **Documentation:** Swagger/OpenAPI

### Microservices Structure
```
backend/
├── services/
│   ├── gateway/                # API Gateway
│   │   ├── src/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   └── server.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── auth/                   # Authentication Service
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── routes/
│   │   └── package.json
│   ├── booking/                # Booking Service
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── routes/
│   │   └── package.json
│   ├── payment/                # Payment Service
│   ├── notification/           # Notification Service
│   ├── tracking/              # Real-time Tracking
│   ├── file/                  # File Upload Service
│   └── analytics/             # Analytics Service
├── shared/                    # Shared utilities
│   ├── database/
│   ├── middleware/
│   ├── types/
│   └── utils/
└── infrastructure/            # Docker, scripts, configs
    ├── docker-compose.yml
    ├── nginx.conf
    └── scripts/
```

### RESTful API Design

**Authentication Endpoints:**
```
POST   /api/auth/register      # User registration
POST   /api/auth/login         # User login
POST   /api/auth/refresh       # Refresh token
POST   /api/auth/logout        # User logout
POST   /api/auth/forgot        # Password reset request
POST   /api/auth/reset         # Password reset confirmation
GET    /api/auth/verify/:token # Email verification
```

**User Management:**
```
GET    /api/users/profile      # Get user profile
PUT    /api/users/profile      # Update profile
GET    /api/users/:id          # Get user by ID (admin only)
GET    /api/users              # List users (admin only)
DELETE /api/users/:id          # Delete user (admin only)
```

**Booking Management:**
```
POST   /api/bookings           # Create new booking
GET    /api/bookings/:id       # Get booking details
PUT    /api/bookings/:id       # Update booking
DELETE /api/bookings/:id       # Cancel booking
GET    /api/bookings           # List user bookings
GET    /api/bookings/:id/status # Get booking status
PUT    /api/bookings/:id/status # Update booking status
POST   /api/bookings/:id/photos # Upload damage photos
```

**Service Management:**
```
GET    /api/services           # List all services
GET    /api/services/:id       # Get service details
GET    /api/services/pricing   # Get dynamic pricing
POST   /api/services           # Create service (admin only)
PUT    /api/services/:id       # Update service (admin only)
```

**Payment Processing:**
```
POST   /api/payments/intent    # Create payment intent
POST   /api/payments/confirm   # Confirm payment
GET    /api/payments/:id       # Get payment details
GET    /api/payments           # List payments
POST   /api/payments/refund    # Process refund
```

**Real-time Tracking:**
```
WebSocket /ws/tracking/:bookingId    # Live tracking
WebSocket /ws/notifications          # Push notifications
GET    /api/tracking/:bookingId      # Get current location
PUT    /api/tracking/:bookingId      # Update location
```

### Database Schema Design

**Core Tables (PostgreSQL):**
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role user_role DEFAULT 'customer',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User addresses
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  street_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'UK',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Service types
CREATE TABLE service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_emergency BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_type_id UUID REFERENCES service_types(id),
  vehicle_make VARCHAR(100),
  vehicle_model VARCHAR(100),
  vehicle_year INTEGER,
  location_address TEXT NOT NULL,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  scheduled_datetime TIMESTAMP NOT NULL,
  status booking_status DEFAULT 'pending',
  total_amount DECIMAL(10, 2),
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Technicians
CREATE TABLE technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(100),
  vehicle_registration VARCHAR(20),
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  status technician_status DEFAULT 'available',
  rating DECIMAL(3, 2) DEFAULT 5.0,
  total_jobs INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Booking assignments
CREATE TABLE booking_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES technicians(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  status assignment_status DEFAULT 'assigned',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255),
  paypal_order_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',
  status payment_status DEFAULT 'pending',
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Booking photos
CREATE TABLE booking_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  description TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enums
CREATE TYPE user_role AS ENUM ('customer', 'technician', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE technician_status AS ENUM ('available', 'busy', 'offline');
CREATE TYPE assignment_status AS ENUM ('assigned', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE notification_type AS ENUM ('booking_update', 'payment_update', 'technician_update', 'promotion');
```

## 3. Authentication & Authorization

### JWT Authentication Flow
```typescript
// Authentication middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Role-based authorization
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### Security Measures
- Password hashing with bcrypt (12 rounds)
- JWT with short expiration (15 minutes) + refresh tokens
- Rate limiting on authentication endpoints
- Account lockout after failed attempts
- Two-factor authentication for admin accounts
- Secure password reset with time-limited tokens

## 4. Payment Processing Integration

### Stripe Integration
```typescript
// Payment intent creation
export const createPaymentIntent = async (bookingId: string, amount: number) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to pence
    currency: 'gbp',
    metadata: {
      booking_id: bookingId,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
};

// Webhook handling for payment events
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed.`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
  }

  res.json({ received: true });
};
```

### PayPal Integration
```typescript
// PayPal order creation
export const createPayPalOrder = async (bookingId: string, amount: number) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'GBP',
        value: amount.toString()
      },
      custom_id: bookingId
    }]
  });

  const order = await paypalClient.execute(request);
  return order;
};
```

## 5. Real-time Features

### WebSocket Architecture
```typescript
// Socket.io server setup
import { Server as SocketIOServer } from 'socket.io';
import { authenticateSocketToken } from '../middleware/auth';

export const setupWebSocket = (server: any) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware for socket connections
  io.use(authenticateSocketToken);

  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);

    // Join booking-specific rooms
    socket.on('join_booking', (bookingId) => {
      socket.join(`booking_${bookingId}`);
    });

    // Handle technician location updates
    socket.on('location_update', async (data) => {
      if (socket.userRole === 'technician') {
        await updateTechnicianLocation(socket.userId, data.latitude, data.longitude);

        // Broadcast to customers tracking this technician
        const assignments = await getActiveTechnicianAssignments(socket.userId);
        assignments.forEach(assignment => {
          socket.to(`booking_${assignment.booking_id}`).emit('technician_location', {
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: new Date()
          });
        });
      }
    });

    // Handle booking status updates
    socket.on('booking_status_update', async (data) => {
      if (socket.userRole === 'technician' || socket.userRole === 'admin') {
        await updateBookingStatus(data.bookingId, data.status);

        // Notify customer
        socket.to(`booking_${data.bookingId}`).emit('booking_status_changed', {
          status: data.status,
          timestamp: new Date()
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId);
    });
  });

  return io;
};
```

### GPS Tracking Implementation
```typescript
// Technician location tracking
export class LocationTracker {
  private watchId: number | null = null;
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  startTracking() {
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Send location update to server
          this.socket.emit('location_update', {
            latitude,
            longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          console.error('Location tracking error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    }
  }

  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}
```

## 6. File Upload System

### File Upload Architecture
```typescript
// Multer configuration for file uploads
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per upload
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF allowed.'));
    }
  }
});

// Upload endpoint
export const uploadBookingPhotos = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadPromises = files.map(async (file) => {
      const key = `bookings/${bookingId}/${Date.now()}-${file.originalname}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private'
      });

      await s3Client.send(command);

      // Save file record to database
      const photo = await prisma.bookingPhoto.create({
        data: {
          booking_id: bookingId,
          file_url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
          file_size: file.size,
          mime_type: file.mimetype,
          description: req.body.description || ''
        }
      });

      return photo;
    });

    const uploadedPhotos = await Promise.all(uploadPromises);

    res.json({
      message: 'Photos uploaded successfully',
      photos: uploadedPhotos
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
};
```

### Frontend File Upload Component
```typescript
// React file upload component
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export const PhotoUpload: React.FC<{ bookingId: string }> = ({ bookingId }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);

    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('photos', file);
    });

    try {
      const response = await fetch(`/api/bookings/${bookingId}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedFiles(prev => [...prev, ...acceptedFiles]);
        console.log('Upload successful:', result);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }, [bookingId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div>Uploading...</div>
        ) : (
          <div>
            <p>Drag & drop damage photos here, or click to select</p>
            <p className="text-sm text-gray-500 mt-2">
              Max 5 files, 10MB each. JPEG, PNG, GIF supported.
            </p>
          </div>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Uploaded Photos:</h4>
          <div className="grid grid-cols-3 gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="text-sm p-2 bg-gray-100 rounded">
                {file.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

## 7. Notification System

### Email Notifications (SendGrid)
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export class EmailService {
  static async sendBookingConfirmation(booking: any, user: any) {
    const msg = {
      to: user.email,
      from: process.env.FROM_EMAIL!,
      templateId: 'd-booking-confirmation-template',
      dynamicTemplateData: {
        user_name: `${user.first_name} ${user.last_name}`,
        booking_id: booking.id,
        service_type: booking.service_type.name,
        scheduled_date: booking.scheduled_datetime,
        location: booking.location_address,
        total_amount: booking.total_amount
      }
    };

    try {
      await sgMail.send(msg);
      console.log('Booking confirmation email sent');
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }

  static async sendTechnicianAssignment(booking: any, technician: any) {
    const msg = {
      to: technician.user.email,
      from: process.env.FROM_EMAIL!,
      templateId: 'd-technician-assignment-template',
      dynamicTemplateData: {
        technician_name: `${technician.user.first_name}`,
        booking_id: booking.id,
        customer_name: `${booking.user.first_name} ${booking.user.last_name}`,
        service_type: booking.service_type.name,
        location: booking.location_address,
        scheduled_date: booking.scheduled_datetime
      }
    };

    await sgMail.send(msg);
  }
}
```

### SMS Notifications (Twilio)
```typescript
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export class SMSService {
  static async sendBookingConfirmation(phone: string, bookingId: string) {
    try {
      await client.messages.create({
        body: `Your Tyre Hero booking ${bookingId} has been confirmed. We'll send updates as your technician approaches.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
    } catch (error) {
      console.error('SMS sending failed:', error);
    }
  }

  static async sendTechnicianEnRoute(phone: string, technicianName: string, eta: string) {
    await client.messages.create({
      body: `Your Tyre Hero technician ${technicianName} is on the way! ETA: ${eta}. Track live at tyrehero.co.uk/tracking`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
  }

  static async sendServiceComplete(phone: string, bookingId: string) {
    await client.messages.create({
      body: `Your Tyre Hero service (${bookingId}) is complete! Please rate your experience in the app.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
  }
}
```

### Push Notifications
```typescript
// Service worker for push notifications
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: data.data,
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Frontend push subscription
export const subscribeToPushNotifications = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY!)
    });

    // Send subscription to server
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(subscription)
    });
  }
};
```

## 8. Admin Dashboard Architecture

### Dashboard Features
```typescript
// Admin dashboard components
export const AdminDashboard: React.FC = () => {
  const { data: stats } = useGetDashboardStatsQuery();
  const { data: recentBookings } = useGetRecentBookingsQuery();
  const { data: activeTechnicians } = useGetActiveTechniciansQuery();

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Today's Bookings"
          value={stats?.todayBookings || 0}
          change={stats?.bookingsChange}
          icon="📅"
        />
        <MetricCard
          title="Active Technicians"
          value={stats?.activeTechnicians || 0}
          change={stats?.techniciansChange}
          icon="👷"
        />
        <MetricCard
          title="Revenue (Today)"
          value={`£${stats?.todayRevenue || 0}`}
          change={stats?.revenueChange}
          icon="💰"
        />
        <MetricCard
          title="Avg Response Time"
          value={`${stats?.avgResponseTime || 0} min`}
          change={stats?.responseTimeChange}
          icon="⏱️"
        />
      </div>

      {/* Real-time Booking Map */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Live Bookings Map</h3>
        <LiveBookingsMap bookings={recentBookings} technicians={activeTechnicians} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
          <BookingsList bookings={recentBookings} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Technician Status</h3>
          <TechnicianStatusList technicians={activeTechnicians} />
        </div>
      </div>
    </div>
  );
};
```

### Admin Role Management
```typescript
// Role-based component access
export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: string[];
}> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Usage in routing
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminLayout />
    </ProtectedRoute>
  }
/>
```

## 9. PWA Implementation

### Service Worker Setup
```typescript
// public/sw.js
const CACHE_NAME = 'tyre-hero-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).catch(() => {
          // Return offline page for navigation requests
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'booking-sync') {
    event.waitUntil(syncBookings());
  }
});
```

### Web App Manifest
```json
{
  "name": "Tyre Hero - Emergency Tyre Service",
  "short_name": "Tyre Hero",
  "description": "Professional mobile tyre fitting and emergency roadside assistance",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#dc2626",
  "orientation": "portrait-primary",
  "categories": ["automotive", "emergency", "business"],
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "Book Emergency Service",
      "short_name": "Emergency",
      "description": "Book emergency tyre service",
      "url": "/booking?type=emergency",
      "icons": [{ "src": "/emergency-icon.png", "sizes": "96x96" }]
    },
    {
      "name": "Track Service",
      "short_name": "Track",
      "description": "Track your technician",
      "url": "/tracking",
      "icons": [{ "src": "/tracking-icon.png", "sizes": "96x96" }]
    }
  ]
}
```

## 10. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
**Week 1-2: Project Setup & Backend Foundation**
- Set up project repository and development environment
- Configure TypeScript, ESLint, Prettier for both frontend and backend
- Set up Docker containers for local development
- Implement basic Express.js server with middleware
- Set up PostgreSQL database with Prisma ORM
- Implement basic authentication system (JWT)

**Week 3-4: Core API Development**
- User registration and login endpoints
- Database schema implementation
- Basic CRUD operations for users
- Password reset functionality
- Email verification system
- API documentation with Swagger

### Phase 2: Booking System (Weeks 5-8)
**Week 5-6: Booking API & Frontend Setup**
- Booking creation and management endpoints
- Service types and pricing API
- React frontend setup with Vite and Tailwind
- Component library and design system
- React Router setup and basic pages

**Week 7-8: Booking Flow Implementation**
- Multi-step booking wizard
- Location picker with Google Maps
- Time slot selection
- Vehicle information forms
- Booking confirmation and management

### Phase 3: Payments & Real-time (Weeks 9-12)
**Week 9-10: Payment Integration**
- Stripe payment integration
- PayPal payment integration
- Payment webhooks and status handling
- Refund processing
- Payment history and receipts

**Week 11-12: Real-time Features**
- WebSocket implementation with Socket.io
- Live booking status updates
- GPS tracking for technicians
- Real-time notifications
- Technician dispatch system

### Phase 4: Advanced Features (Weeks 13-16)
**Week 13-14: File Upload & Notifications**
- AWS S3 file upload system
- Damage photo upload and management
- Email notification system (SendGrid)
- SMS notification system (Twilio)
- Push notification implementation

**Week 15-16: Admin Dashboard & PWA**
- Admin dashboard with analytics
- User and booking management
- Technician management
- PWA implementation
- Service worker and offline capabilities

### Phase 5: Testing & Deployment (Weeks 17-20)
**Week 17-18: Testing & Optimization**
- Comprehensive unit and integration testing
- End-to-end testing with Playwright
- Performance optimization
- Security audit and fixes
- Load testing and scalability improvements

**Week 19-20: Production Deployment**
- Production environment setup
- CI/CD pipeline implementation
- Monitoring and logging setup
- Performance monitoring
- User acceptance testing and bug fixes

## Technology Recommendations

### Frontend Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@reduxjs/toolkit": "^1.9.0",
    "react-redux": "^8.0.0",
    "@tanstack/react-query": "^4.24.0",
    "react-hook-form": "^7.43.0",
    "zod": "^3.20.0",
    "@hookform/resolvers": "^2.9.0",
    "axios": "^1.3.0",
    "socket.io-client": "^4.6.0",
    "@googlemaps/react-wrapper": "^1.1.0",
    "react-dropzone": "^14.2.0",
    "@stripe/stripe-js": "^1.46.0",
    "@stripe/react-stripe-js": "^1.16.0",
    "date-fns": "^2.29.0",
    "framer-motion": "^9.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.1.0",
    "tailwindcss": "^4.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@playwright/test": "^1.30.0",
    "vitest": "^0.28.0"
  }
}
```

### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "typescript": "^4.9.0",
    "@types/express": "^4.17.0",
    "prisma": "^4.10.0",
    "@prisma/client": "^4.10.0",
    "bcryptjs": "^2.4.0",
    "jsonwebtoken": "^9.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.0",
    "multer": "^1.4.0",
    "@aws-sdk/client-s3": "^3.0.0",
    "socket.io": "^4.6.0",
    "stripe": "^11.0.0",
    "@sendgrid/mail": "^7.7.0",
    "twilio": "^3.84.0",
    "zod": "^3.20.0",
    "cors": "^2.8.0",
    "helmet": "^6.0.0",
    "express-rate-limit": "^6.7.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "@types/bcryptjs": "^2.4.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/multer": "^1.4.0",
    "jest": "^29.0.0",
    "supertest": "^6.3.0",
    "ts-node": "^10.9.0",
    "nodemon": "^2.0.0"
  }
}
```

## Security Considerations

### API Security
- Input validation on all endpoints
- SQL injection prevention with parameterized queries
- XSS protection with content security policy
- CSRF protection with secure tokens
- Rate limiting on all public endpoints
- API key rotation for external services

### Data Protection
- Encryption at rest for sensitive data
- Encryption in transit with HTTPS/TLS
- Personal data anonymization for analytics
- GDPR compliance for UK customers
- Regular security audits and penetration testing

### Infrastructure Security
- Container security scanning
- Secrets management with environment variables
- Database connection encryption
- VPC networking for cloud resources
- Regular dependency updates and vulnerability scanning

## Monitoring & Analytics

### Application Monitoring
- Error tracking with Sentry
- Performance monitoring with New Relic
- User session recording with LogRocket
- API monitoring with Postman
- Uptime monitoring with UptimeRobot

### Business Analytics
- Booking conversion funnel analysis
- Customer lifetime value tracking
- Technician performance metrics
- Revenue and payment analytics
- Geographic service area analysis

## Conclusion

This comprehensive architecture provides a solid foundation for transforming Tyre Hero into a full-featured tyre service platform. The design emphasizes:

- **Scalability**: Microservices architecture allows independent scaling
- **Security**: Multi-layered security with authentication, authorization, and data protection
- **Maintainability**: Clear separation of concerns and modern development practices
- **User Experience**: Real-time features, mobile optimization, and PWA capabilities
- **Business Value**: Comprehensive booking, payment, and management systems

The phased implementation approach ensures steady progress while maintaining quality and allowing for iterative improvements based on user feedback and business requirements.