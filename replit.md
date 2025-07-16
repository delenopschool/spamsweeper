# Spam Sweeper - AI-Powered Email Spam Management

## Overview

Spam Sweeper is a full-stack web application that helps users clean up their email inboxes by using AI to identify spam emails and automatically find unsubscribe links. The application integrates with Microsoft Graph API to access user emails and uses OpenRouter with DeepSeek Chat v3 for AI-powered spam classification.

## User Preferences

Preferred communication style: Simple, everyday language.
Preferred language: Dutch (Nederlands)

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
2. **AI Classification**: Uses OpenRouter with DeepSeek Chat v3 free model to analyze emails for spam indicators with confidence scoring
3. **Unsubscribe Detection**: Parses email content to find unsubscribe links and mailto addresses
4. **Batch Processing**: Handles multiple emails efficiently with proper error handling and progress tracking

### UI/UX Features
- **Responsive Design**: Full mobile support with adaptive layouts
- **Dark/Light Mode**: Theme switching with system preference detection
- **Progressive Enhancement**: Works on all devices with proper fallbacks
- **Status Cards**: Real-time display of scan statistics and progress
- **Email Review Table**: Paginated table for reviewing detected spam emails with preview functionality

## Data Flow

1. **User Authentication**: User authenticates via Microsoft OAuth, tokens stored in database
2. **Email Scanning**: System fetches emails from Microsoft Graph API's Junk Email folder
3. **AI Analysis**: Each email is analyzed by OpenRouter's DeepSeek model for spam classification
4. **Unsubscribe Detection**: Email content is parsed to identify unsubscribe links
5. **Data Persistence**: Scan results, email metadata, and classification results stored in database
6. **User Review**: Dashboard displays results with options to preview, select, and process emails

## External Dependencies

### Core Services
- **Microsoft Graph API**: Email access and user authentication
- **OpenRouter API**: AI-powered spam classification using DeepSeek Chat v3 model
- **Neon Database**: PostgreSQL database hosting (configured via DATABASE_URL)

### Development Tools
- **Vite**: Build tool and development server
- **Drizzle ORM**: Database schema management and queries
- **TypeScript**: Type safety across the entire application

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React application to `dist/public`
- **Backend**: esbuild bundles Node.js server to `dist/index.js`
- **Database**: Drizzle manages schema migrations

### Environment Configuration
- **Development**: Uses `NODE_ENV=development` with hot reloading
- **Production**: Uses `NODE_ENV=production` with optimized builds
- **Database**: Requires `DATABASE_URL` environment variable
- **API Keys**: Requires `OPENROUTER_API_KEY` for AI classification

### Hosting Requirements
- **Node.js Runtime**: Compatible with serverless and traditional hosting
- **Database**: PostgreSQL database (configured for Neon)
- **Domain**: OAuth callback URLs configured for both development and production environments

### Recent Improvements
- **Persistent Scan History**: Dashboard shows last scan results on login
- **Mobile Optimization**: Full responsive design implementation
- **Theme Support**: Dark/light mode with system preference detection
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance Optimizations**: Multiple performance improvements implemented (Jan 2025)
  - Search debouncing (300ms) to reduce API calls during typing
  - React.memo for components to prevent unnecessary re-renders
  - useMemo/useCallback for expensive calculations and functions
  - Query caching with staleTime (30s-5min) to reduce server requests
  - Database query optimizations with ordering and limits
  - Optimized search queries with proper filtering and result limits
- **Learning System**: AI learns from user feedback via thumbs up/down buttons
- **Search Functionality**: Real-time search through emails by sender, subject, and content
- **Advanced Unsubscribe Processing** (July 2025):
  - Multilingual pattern recognition for Dutch, German, French, and English
  - Real HTTP requests to unsubscribe URLs with automatic form detection
  - Intelligent form parsing and submission for complex unsubscribe workflows
  - Success detection in multiple languages with detailed logging
  - Timeout handling and error recovery for robust processing
- **Replit Migration (July 2025)**: Successfully migrated from Replit Agent to standard Replit environment
  - Fixed email preview functionality to properly load email content
  - Implemented working thumbs up/down feedback system for AI learning
  - Added functional "Process selected emails" button for batch unsubscribe operations
  - Fixed API request patterns throughout the frontend
  - Added proper accessibility descriptions to dialog modals
  - Updated all database connections and environment variable handling
- **Gmail Integration (July 2025)**: Added full Gmail support alongside Microsoft Graph
  - Implemented Google OAuth authentication flow
  - Added Gmail API integration for spam email scanning
  - Updated database schema to support multiple email providers
  - Modified frontend to offer both Gmail and Outlook connection options
  - Enhanced backend to handle both Microsoft Graph and Gmail APIs
  - Fixed OAuth redirect URI configuration for production deployment on Render
  - Both services now use correct Render URLs: spamsweeper.onrender.com

The application is designed to be easily deployable to platforms like Render, Vercel, or similar services with minimal configuration changes.