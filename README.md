# Spam Sweeper - AI-Powered Email Spam Management

## Overview

Spam Sweeper is a full-stack web application that helps users clean up their email inboxes by using AI to identify spam emails and automatically find unsubscribe links. The application integrates with Microsoft Outlook/Exchange through the Microsoft Graph API and uses OpenAI's GPT-4o model for intelligent spam classification.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **July 13, 2025**: Migrated from in-memory storage to PostgreSQL database using Drizzle ORM
- **July 13, 2025**: Added comprehensive debugging logging to AI classification process for performance monitoring
- **July 12, 2025**: Migrated from OpenAI to OpenRouter AI for spam classification using free Llama 3.1 8B model
- **July 12, 2025**: Fixed React Query scope errors causing white screen issues on dashboard
- **July 12, 2025**: Simplified dashboard state management for better stability
- **January 10, 2025**: Logo updated to custom Spam Sweeper logo with 7px border-radius
- **January 10, 2025**: Redirect URI configured for Render deployment: https://spamsweeper.onrender.com/auth/callback

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
2. **AI Classification**: Uses OpenRouter with Llama 3.1 8B model to analyze emails for spam indicators with confidence scoring
3. **Link Extraction**: Parses email content to find unsubscribe links using regex patterns and heuristics
4. **Batch Processing**: Handles large volumes of emails efficiently with progress tracking

### Database Schema
- **Users Table**: Stores user authentication data and Microsoft account information
- **Email Scans Table**: Tracks scan sessions with progress statistics and status
- **Spam Emails Table**: Stores detected spam emails with AI confidence scores and unsubscribe information

## Data Flow

1. **Authentication Flow**: User authenticates via Microsoft OAuth → tokens stored → user session created
2. **Email Scanning**: User initiates scan → emails fetched from Junk folder → AI processes each email → results stored in database
3. **Review Process**: User reviews detected spam emails → can select/deselect emails for processing
4. **Unsubscribe Processing**: System automatically visits unsubscribe links for selected emails

## External Dependencies

### Third-Party Services
- **Microsoft Graph API**: For OAuth authentication and email access
- **OpenRouter API**: For AI-powered spam classification using free Llama 3.1 8B Instruct model
- **Neon Database**: PostgreSQL database hosting (based on @neondatabase/serverless dependency)

### Key Libraries
- **Database**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: Microsoft Graph Client for OAuth flow
- **UI Components**: Comprehensive Radix UI component library with shadcn/ui styling
- **State Management**: TanStack React Query for efficient server state management

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite provides fast development server with HMR
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Database Migrations**: Drizzle Kit for schema management and migrations

### Production Considerations
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Environment Variables**: Secure handling of API keys and database credentials
- **Error Handling**: Comprehensive error boundaries and API error responses
- **Performance**: Optimized queries, caching strategies, and efficient bundle sizes

### Architectural Decisions

1. **Database Choice**: PostgreSQL with Drizzle ORM chosen for type safety and relational data modeling
2. **UI Framework**: Radix UI + shadcn/ui selected for accessibility and consistent design system
3. **State Management**: React Query chosen over Redux for server state management simplicity
4. **Routing**: Wouter selected as lightweight alternative to React Router
5. **AI Integration**: OpenRouter with free Llama 3.1 8B model chosen for cost-effective spam classification
6. **Email Integration**: Microsoft Graph API chosen for robust enterprise email access

The system prioritizes type safety, developer experience, and scalable architecture while maintaining simplicity in the codebase.