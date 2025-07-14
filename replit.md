# Spam Sweeper - AI-Powered Email Spam Management

## Overview

Spam Sweeper is a full-stack web application that helps users clean up their email inboxes by using AI to identify spam emails and automatically find unsubscribe links. The application integrates with Microsoft Outlook/Graph API to fetch emails from users' junk folders, uses AI classification to identify spam with confidence scores, and provides a user-friendly interface for managing detected spam emails.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **January 14, 2025**: Successfully migrated project from Replit Agent to Replit environment
- **January 14, 2025**: Replaced Smart Review Process logo with custom green SVG icon
- **January 14, 2025**: Added full responsive design support for mobile devices
- **January 14, 2025**: Implemented dark/light mode functionality with theme toggle
- **January 14, 2025**: User customized feature card icons - these customizations should be preserved

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
3. **Link Extraction**: Parses email content to find unsubscribe links using regex patterns and heuristics
4. **Data Storage**: Persists scan results, email details, and user selections in PostgreSQL database

### User Interface Components
- **Dashboard**: Main interface showing scan statistics and email review table
- **Email Review Table**: Paginated table for reviewing detected spam emails with selection controls
- **Email Preview Modal**: Detailed view of individual emails with HTML rendering
- **Processing Modal**: Progress indicator during email scanning operations
- **Status Cards**: Visual summary of scan results and statistics

## Data Flow

1. **User Authentication**: User logs in via Microsoft OAuth, tokens are stored in database
2. **Email Scanning**: Application fetches emails from Microsoft Graph API
3. **AI Processing**: Each email is analyzed by OpenRouter AI for spam classification
4. **Link Detection**: Email content is parsed to find unsubscribe links
5. **Data Persistence**: Results are stored in PostgreSQL with user associations
6. **User Review**: Dashboard displays results with interactive controls for email management
7. **Bulk Actions**: Users can select/deselect emails for processing

## External Dependencies

### AI Services
- **OpenRouter**: AI classification service using DeepSeek Chat v3 free model
- **Microsoft Graph API**: Email fetching and user authentication
- **Neon Database**: PostgreSQL hosting service

### Frontend Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack React Query**: Server state management
- **Wouter**: Lightweight routing
- **Vite**: Build tool and development server

### Backend Libraries
- **Drizzle ORM**: Type-safe database operations
- **Microsoft Graph Client**: Official Microsoft Graph SDK
- **Express.js**: Web application framework

## Deployment Strategy

- **Platform**: Render.com for full-stack deployment
- **Database**: Neon PostgreSQL for production data storage
- **Environment**: Node.js production environment with built static assets
- **Build Process**: Vite builds frontend assets, esbuild bundles backend code
- **Configuration**: Environment variables for API keys, database connections, and OAuth settings

The application is designed to be scalable and maintainable, with clear separation of concerns and comprehensive error handling throughout the stack.