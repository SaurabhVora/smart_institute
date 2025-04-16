# Industry Link Portal

A comprehensive web application that connects students, faculty, and industry partners to facilitate internships, document management, and industry collaborations.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [License](#license)
- [Contact](#contact)

## Features

- **User Authentication**
  - Secure login for students, faculty, and industry partners
  - Role-based access control
  - Password reset functionality
  - Email verification

- **Internship Management**
  - Post new internship opportunities (for companies)
  - Apply to internships (for students)
  - Track application status
  - Filter internships by location, company, skills, etc.
  - Deadline notifications

- **Document Management**
  - Upload, review, and track important documents
  - Document versioning
  - Feedback system for document reviews
  - Automated status updates

- **Faculty Mentorship**
  - Allocation system for faculty mentors to students
  - Dashboard for mentors to track student progress
  - Communication tools between mentors and students

- **Technical Sessions**
  - Schedule and manage technical sessions with industry experts
  - Registration for sessions
  - Feedback collection after sessions
  - Resource sharing

## Tech Stack

### Frontend
- **React 18**: Modern UI library for building interactive interfaces
- **TypeScript**: For type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Component library based on Radix UI
- **React Query**: For data fetching and state management
- **React Hook Form**: For form validation
- **Wouter**: For lightweight routing

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework for Node.js
- **TypeScript**: For type safety
- **Drizzle ORM**: Type-safe SQL query builder
- **PostgreSQL**: Relational database
- **AWS S3**: Cloud storage for document management
- **Passport.js**: Authentication middleware
- **Zod**: Schema validation

## Architecture

The application follows a client-server architecture:

```
┌─────────────┐       ┌─────────────┐      ┌─────────────┐
│             │       │             │      │             │
│   React     │◄─────►│   Express   │◄────►│  PostgreSQL │
│   Frontend  │       │   Backend   │      │  Database   │
│             │       │             │      │             │
└─────────────┘       └──────┬──────┘      └─────────────┘
                             │
                      ┌──────▼──────┐
                      │             │
                      │    AWS S3   │
                      │   Storage   │
                      │             │
                      └─────────────┘
```

- **Client-Side Rendering**: React with TypeScript
- **RESTful API**: Express based backend services
- **Data Persistence**: PostgreSQL with Drizzle ORM
- **Storage**: AWS S3 for document storage
- **Authentication**: JWT and session-based auth with Passport.js

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- AWS account (for S3 storage)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/SaurabhVora/smart_institute.git
   cd smart_institute
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up your environment variables (see section below)

4. Run database migrations
   ```bash
   npm run db:push
   npm run db:migrate
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. The application will be available at `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL=postgres://username:password@localhost:5432/dbname

# Authentication
SESSION_SECRET=your_session_secret

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket_name

# Email (optional for password reset)
EMAIL_SERVICE=smtp.example.com
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
EMAIL_FROM=noreply@example.com
```

## Project Structure

```
.
├── client/                  # Frontend React application
│   ├── src/                 # Source files
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── App.tsx          # Main application component
│   ├── index.html           # HTML entry point
│   └── vite.config.ts       # Vite configuration
├── server/                  # Backend Express API
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic
│   ├── scripts/             # Utility scripts
│   ├── migrations/          # Database migration scripts
│   └── index.ts             # Server entry point
├── shared/                  # Shared types and utilities
│   └── schema.ts            # Shared schema definitions
├── migrations/              # Database migrations
├── package.json             # Project dependencies
└── README.md                # Project documentation
```

## API Documentation

The API follows RESTful conventions and is organized by resource:

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Request password reset
- `POST /api/auth/verify-email` - Verify email address

### Internship Endpoints

- `GET /api/internships` - List all internships
- `GET /api/internships/:id` - Get internship details
- `POST /api/internships` - Create new internship
- `PUT /api/internships/:id` - Update internship
- `DELETE /api/internships/:id` - Delete internship
- `POST /api/internships/:id/apply` - Apply to internship

### Document Endpoints

- `GET /api/documents` - List user documents
- `POST /api/documents` - Upload new document
- `GET /api/documents/:id` - Get document details
- `PUT /api/documents/:id/feedback` - Provide document feedback

### User Endpoints

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/:id` - Get user by ID (admin only)

## Database Schema

The database includes the following main tables:

- **Users**: User accounts and authentication
- **Profiles**: Extended user profile information
- **Internships**: Internship listings
- **Applications**: Student applications for internships
- **Documents**: User uploaded documents
- **Feedback**: Faculty feedback on documents
- **TechSessions**: Technical sessions information
- **Allocations**: Faculty-student allocations

## Deployment

### Production Deployment

1. Build the application
   ```bash
   npm run build
   ```

2. Start the production server
   ```bash
   npm run start
   ```

### Docker Deployment

A Dockerfile is included for containerized deployment:

```bash
docker build -t industry-link-portal .
docker run -p 3000:3000 industry-link-portal
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to update tests as appropriate.

## Testing

Run the test suite with:

```bash
npm run test
```

## Roadmap

- Mobile application development
- Integration with LinkedIn for job applications
- Advanced analytics dashboard
- AI-powered resume feedback
- Video conferencing for virtual interviews

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Saurabh Vora - [GitHub Profile](https://github.com/SaurabhVora)

Project Link: [https://github.com/SaurabhVora/smart_institute](https://github.com/SaurabhVora/smart_institute) 