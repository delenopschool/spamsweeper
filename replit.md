# SpamSweeper - AI-Powered Email Spam Management

## Overview

SpamSweeper is a full-stack web application that helps users clean up their email inboxes by using AI to identify spam emails and automatically find unsubscribe links. The application integrates with Microsoft Outlook/Graph API to access emails and uses OpenAI's GPT-4o model for intelligent spam detection.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend, backend, and data layers:

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system for consistent, accessible components
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Component Structure**: Organized into pages, components, and UI components with clear separation of concerns

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Pattern**: RESTful API design with clear endpoint structure
- **Middleware**: Custom logging, JSON parsing, and error handling middleware
- **Development**: Hot reloading with Vite integration for seamless development experience

## Key Components

### Authentication System
- **Microsoft OAuth Integration**: Uses Microsoft Graph API for secure authentication flow
- **Token Management**: Stores access tokens, refresh tokens, and expiry dates in database
- **User Persistence**: Links Microsoft accounts to internal user records for session management

### Email Processing Pipeline
1. **Email Fetching**: Retrieves emails from Microsoft Graph API (specifically from Junk Email folder)
2. **AI Classification**: Uses OpenAI GPT-4o model to analyze emails for spam indicators with confidence scoring
3. **Link Extraction**: Parses email content to find unsubscribe links using regex patterns and heuristics
4. **Batch Processing**: Handles large volumes of emails efficiently with progress tracking

### Database Schema
- **Users Table**: Stores user authentication data and Microsoft account information
- **Email Scans Table**: Tracks scan sessions with progress statistics and status
- **Spam Emails Table**: Stores detected spam emails with AI confidence scores and unsubscribe information

## Data Flow

1. **Authentication Flow**: User authenticates via Microsoft OAuth → tokens stored → user session created
2. **Scanning Process**: User initiates scan → emails fetched from Microsoft Graph → AI analysis → results stored
3. **Review Process**: User reviews detected spam → selects emails for processing → unsubscribe actions executed
4. **Processing Pipeline**: Selected emails processed for unsubscribe links → automated cleanup performed

## External Dependencies

### Microsoft Graph API
- **Purpose**: Email access and user profile information
- **Authentication**: OAuth 2.0 flow with refresh token support
- **Endpoints**: User profile, mailbox folders, email messages

### OpenAI API
- **Purpose**: AI-powered spam classification
- **Model**: GPT-4o for advanced email content analysis
- **Features**: Confidence scoring, reasoning explanation, spam indicator detection

### Database Integration
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Provider**: Neon Database (serverless PostgreSQL)
- **Migrations**: Drizzle Kit for schema management

## Deployment Strategy

### Development Environment
- **Build Tool**: Vite for fast development and hot module replacement
- **TypeScript**: Full type safety across frontend and backend
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)

### Production Build
- **Frontend**: Vite build with optimized bundle output
- **Backend**: esbuild for Node.js server bundling
- **Assets**: Static file serving with proper caching headers

### Environment Configuration
- **Database**: PostgreSQL connection via DATABASE_URL
- **API Keys**: OpenAI API key for AI services
- **OAuth**: Microsoft application credentials for authentication

The application is designed for scalability with clear separation of concerns, comprehensive error handling, and efficient data processing pipelines.