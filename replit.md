# SpamClean - AI-Powered Email Spam Management

## Overview

SpamClean is a full-stack web application that helps users clean up their email inboxes by using AI to identify spam emails and automatically find unsubscribe links. The application integrates with Microsoft Outlook/Graph API to scan user emails, uses OpenAI's GPT-4o model for intelligent spam classification, and provides a clean React-based dashboard for email management.

## User Preferences

Preferred communication style: Simple, everyday language.
User language: Dutch (Nederlands)

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend, backend, and data layers:

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Component Structure**: Organized into pages, components, and UI components with clear separation of concerns

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Middleware**: Custom logging, JSON parsing, and error handling
- **Development**: Hot reloading with Vite integration for seamless development experience

## Key Components

### Authentication System
- **Microsoft OAuth Integration**: Uses Microsoft Graph API for secure authentication
- **Token Management**: Stores access tokens, refresh tokens, and expiry dates
- **User Persistence**: Links Microsoft accounts to internal user records

### Email Processing Pipeline
1. **Email Fetching**: Retrieves emails from Microsoft Graph API (specifically from Junk Email folder)
2. **AI Classification**: Uses OpenAI GPT-4o model to analyze emails for spam indicators
3. **Link Extraction**: Parses email content to find unsubscribe links using regex patterns
4. **Batch Processing**: Handles large volumes of emails efficiently

### Database Schema
- **Users Table**: Stores user authentication data and Microsoft account information
- **Email Scans Table**: Tracks scan sessions with progress and statistics
- **Spam Emails Table**: Stores detected spam emails with AI confidence scores and unsubscribe information

### External Service Integrations
- **Microsoft Graph API**: Email access and user profile information
- **OpenAI API**: GPT-4o model for intelligent spam classification
- **Neon Database**: PostgreSQL database hosting

## Data Flow

1. **User Authentication**: User initiates Microsoft OAuth flow → receives tokens → creates/updates user record
2. **Email Scanning**: User triggers scan → fetches emails from Microsoft Graph → processes through AI classifier → stores results
3. **Review & Action**: User reviews detected spam → selects emails for processing → bulk unsubscribe operations
4. **Real-time Updates**: Frontend polls for scan progress and updates UI accordingly

## External Dependencies

### Core Dependencies
- **Database**: Drizzle ORM with PostgreSQL (Neon serverless)
- **Authentication**: Microsoft Graph Client SDK
- **AI Processing**: OpenAI SDK with GPT-4o model
- **Frontend**: React ecosystem (React Query, Radix UI, Tailwind CSS)
- **Development**: Vite, TypeScript, ESBuild

### Development Tools
- **Build System**: Vite for frontend, ESBuild for backend production builds
- **Database Migrations**: Drizzle Kit for schema management
- **Linting & Type Checking**: TypeScript compiler with strict mode

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public` directory
- **Backend**: ESBuild bundles server code to `dist` directory with external package dependencies
- **Database**: Drizzle Kit handles schema migrations and database setup

### Environment Configuration
- **Development**: Uses `tsx` for TypeScript execution with hot reloading
- **Production**: Runs compiled JavaScript with Node.js
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection
- **APIs**: Requires `OPENAI_API_KEY` for AI classification functionality

### Hosting Requirements
- **Node.js Environment**: Supports ES modules and TypeScript
- **PostgreSQL Database**: Compatible with Neon serverless or standard PostgreSQL
- **Environment Variables**: Secure storage for API keys and database credentials
- **Static Asset Serving**: Express serves built React application in production

The application is designed to be easily deployable on platforms like Replit, Vercel, or any Node.js hosting service with proper environment variable configuration.

## Recent Changes

- **January 2025**: Complete SpamClean application implemented with:
  - Full Microsoft OAuth integration for Outlook email access
  - AI-powered spam classification using OpenAI GPT-4o
  - Unsubscribe link detection and automated processing
  - Interactive React dashboard with email review and management
  - Real-time progress tracking and processing modals
  - Secure token management and refresh handling

## Environment Variables Required

- `OPENAI_API_KEY`: OpenAI API key for AI-powered spam classification
- `MICROSOFT_CLIENT_ID`: Microsoft OAuth client ID for email access
- `MICROSOFT_CLIENT_SECRET`: Microsoft OAuth client secret for authentication

## Current Status

The application is fully functional and ready for deployment. Users can:
1. Connect their Outlook account through secure Microsoft OAuth
2. Scan their spam folder for emails
3. Review AI classifications with confidence scores
4. Automatically process unsubscribe links from selected emails
5. View detailed email previews and manage selections