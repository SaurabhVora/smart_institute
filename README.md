# Industry Link Portal

A comprehensive web application that connects students, faculty, and industry partners to facilitate internships, document management, and industry collaborations.

## Features

- **User Authentication**: Secure login for students, faculty, and industry partners
- **Internship Management**: Post, apply, and track internships
- **Document Management**: Upload, review, and track important documents
- **Faculty Mentorship**: Allocation system for faculty mentors to students
- **Technical Sessions**: Schedule and manage technical sessions with industry experts

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: AWS S3 for document storage
- **Authentication**: Passport.js

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL

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

3. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgres://username:password@localhost:5432/dbname
   SESSION_SECRET=your_session_secret
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   AWS_S3_BUCKET=your_s3_bucket_name
   ```

4. Run database migrations
   ```bash
   npm run db:migrate
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

## Project Structure

- `client/` - Frontend React application
- `server/` - Backend Express API
- `shared/` - Shared types and utilities
- `migrations/` - Database migrations

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 