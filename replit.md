# VoiceReview - Voice-to-Text Product Review Platform

## Overview

VoiceReview is a modern e-commerce review interface that enables users to leave product reviews using voice input. The application automatically transcribes spoken reviews, detects the language, and provides translation capabilities for global users. It combines voice recording technology with a clean, accessible UI inspired by modern e-commerce platforms like Shopify and Etsy, and productivity tools like Linear and Notion.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript
- Single-page application using Vite as the build tool
- Client-side routing with Wouter for lightweight navigation
- Component-based architecture with shadcn/ui design system

**State Management**:
- TanStack Query (React Query) for server state and data fetching
- Local component state using React hooks
- No global state management library - state is colocated with components

**UI Components**:
- shadcn/ui components built on Radix UI primitives for accessibility
- Tailwind CSS for styling with custom design tokens
- Custom theme system with light/dark mode support
- Typography using Inter font family via Google Fonts CDN

**Key Features**:
- Voice recording via Web Speech API and MediaRecorder API
- Real-time transcription with language detection
- Inline editing of transcribed text
- Star rating system for product reviews
- Multi-language support with translation display
- Responsive design for mobile and desktop

### Backend Architecture

**Server Framework**: Express.js
- RESTful API structure (routes prefixed with `/api`)
- HTTP server with middleware for JSON parsing and URL encoding
- Static file serving for production builds
- Development mode with Vite middleware integration and HMR

**Storage Layer**:
- Interface-based storage abstraction (`IStorage`)
- In-memory storage implementation (`MemStorage`) for development
- Designed to be swapped with database-backed storage in production
- Uses PostgreSQL dialect configuration (Drizzle ORM ready)

**Database Schema**:
- Users table with username/password authentication fields
- UUID-based primary keys
- Schema defined using Drizzle ORM with Zod validation

**Build System**:
- esbuild for server-side bundling with selective dependency bundling
- Vite for client-side builds
- Separate development and production build processes

### External Dependencies

**Third-Party UI Libraries**:
- Radix UI components for accessible, unstyled primitives
- Lucide React for iconography
- Embla Carousel for carousel functionality
- date-fns for date formatting

**Development Tools**:
- TypeScript for type safety
- Drizzle Kit for database migrations
- PostCSS with Tailwind CSS and Autoprefixer
- Replit-specific plugins for development experience

**Planned Integrations** (based on package dependencies):
- PostgreSQL database via `pg` driver
- Drizzle ORM for database operations
- Session management with `express-session` and `connect-pg-simple`
- Authentication ready (passport, passport-local, jsonwebtoken included)
- Potential AI/ML features (OpenAI, Google Generative AI packages present)

**Database Configuration**:
- PostgreSQL configured via DATABASE_URL environment variable
- Migrations output to `./migrations` directory
- Schema located at `./shared/schema.ts`

### Design Philosophy

**Core Principles**:
1. Functional Clarity - Every state change is immediately obvious
2. Progressive Disclosure - Show complexity only when needed
3. Global Accessibility - High contrast, clear iconography, multilingual support
4. Smooth Transitions - Gentle state changes to reduce cognitive load

**Layout System**:
- Maximum width constraints (672px for review sections)
- Consistent spacing using Tailwind's spacing scale (2, 4, 6, 8)
- Mobile-first responsive design
- Centered layouts with comfortable margins

**Component Design**:
- Reusable, composable components with clear props interfaces
- Test IDs on key elements for testing
- Accessibility features (ARIA labels, semantic HTML)
- Keyboard navigation support