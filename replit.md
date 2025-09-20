# Spam Sweeper - AI-Powered Email Spam Management

## Overview
Spam Sweeper is a full-stack web application designed to help users manage and clean their email inboxes. It leverages AI to identify spam emails and automatically locate unsubscribe links. The application integrates with various email providers (Microsoft, Gmail, Yahoo) and uses advanced AI models for spam classification, aiming to simplify inbox management and reduce unwanted emails. The project's ambition is to provide an efficient and user-friendly solution for a cleaner email experience.

## User Preferences
Preferred communication style: Simple, everyday language.
Preferred language: Dutch (Nederlands)

## System Architecture

### UI/UX Decisions
-   **Framework**: React with TypeScript (Vite).
-   **UI Library**: Radix UI components with shadcn/ui for consistent, accessible design.
-   **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design.
-   **Design**: Responsive design with full mobile support, dark/light mode, and progressive enhancement.
-   **Key Features**: Real-time scan statistics, paginated email review table with preview, live AI progress tracker, and a comprehensive multi-language internationalization system (Dutch, German, English, French).

### Technical Implementations
-   **Backend**: Node.js with Express.js (TypeScript, ES modules).
-   **API Pattern**: RESTful API.
-   **Authentication**: Secure OAuth integration with Microsoft Graph, Google OAuth, and Yahoo OAuth for email access and user authentication. Token management and user persistence are handled via a database.
-   **Email Processing**: Retrieves emails (e.g., from Junk Email folder), performs AI classification using external models, and detects unsubscribe links. Supports batch processing with error handling.
-   **AI Classification**: Integrates with external AI services (currently Google Gemini 2.5 Flash API as a memory-optimized solution, previously OpenRouter with DeepSeek Chat v3) for spam detection and confidence scoring. Includes features like AI learning from user feedback and a robust crash recovery system for scans.
-   **Advanced Unsubscribe Processing**: Multilingual pattern recognition, real HTTP requests to unsubscribe URLs, intelligent form parsing, and success detection.

### System Design Choices
-   **Full-Stack Architecture**: Clear separation between frontend (React), backend (Node.js/Express), and data layers.
-   **State Management**: TanStack React Query for server state management and caching.
-   **Routing**: Wouter for lightweight client-side routing.
-   **Data Flow**: User authentication -> Email scanning via provider APIs -> AI analysis -> Unsubscribe detection -> Data persistence in PostgreSQL -> User review via dashboard.
-   **Modularity**: Organized components and clear separation of concerns.

## External Dependencies

-   **Microsoft Graph API**: For accessing user emails and authentication (Outlook/Hotmail).
-   **Google API**: For accessing user emails and authentication (Gmail).
-   **Yahoo Mail API**: For accessing user emails and authentication (requires Yahoo approval for full email access).
-   **Google Gemini 2.5 Flash API**: AI-powered spam classification model (current implementation for memory optimization).
-   **OpenRouter API**: Previously used for AI classification (with DeepSeek Chat v3).
-   **Neon Database**: PostgreSQL database hosting for data persistence.
-   **Vite**: Build tool and development server.
-   **Drizzle ORM**: Database schema management and queries.
-   **Radix UI**: Accessible component primitives.
-   **Tailwind CSS**: Utility-first CSS framework.
-   **Lucide React**: Icon library.