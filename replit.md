# Veggies - Fresh Cut Vegetables E-Commerce Platform

## Overview

Veggies is a modern e-commerce web application specializing in freshly cut vegetables delivered to customers' doorsteps. The platform features a comprehensive product catalog with customizable cut styles, user authentication, cart management, order tracking, wishlist functionality, and administrative controls. Built with React/TypeScript frontend and Express.js backend, it uses PostgreSQL for data persistence and Replit Auth for authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessibility and customization
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: 
  - Zustand for client-side cart state management
  - TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API with structured error handling and request logging
- **Session Management**: Express sessions with PostgreSQL storage
- **Database Access**: Drizzle ORM for type-safe database operations
- **Build System**: ESBuild for production bundling, TSX for development

### Database Design
- **Database**: PostgreSQL with connection pooling via Neon serverless
- **Schema Management**: Drizzle with migrations stored in `/migrations`
- **Core Tables**:
  - `users` - User profiles and authentication data
  - `products` - Product catalog with categories, pricing, and cut styles
  - `cart_items` - Shopping cart persistence with user associations
  - `orders` & `order_items` - Order management with status tracking
  - `wishlist` - User product favorites
  - `sessions` - Session storage for authentication

### Authentication System
- **Provider**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Authorization**: Route-level authentication middleware
- **User Management**: Automatic user creation/updates via OIDC claims

### State Management Strategy
- **Server State**: TanStack Query for API data fetching, caching, and synchronization
- **Client State**: Zustand store for cart sidebar visibility and item management
- **Form State**: React Hook Form for individual form components
- **Authentication State**: Custom hook wrapping TanStack Query for user session

### API Structure
- **Authentication**: `/api/auth/*` - User session management
- **Products**: `/api/products` - Product catalog with category filtering
- **Cart**: `/api/cart` - Shopping cart CRUD operations
- **Orders**: `/api/orders` - Order creation and tracking
- **Wishlist**: `/api/wishlist` - User favorites management
- **Admin**: Separate endpoints for product and order management

### Development Architecture
- **Monorepo Structure**: Shared types and schema between client/server
- **Hot Reloading**: Vite dev server with Express middleware integration
- **Path Aliases**: TypeScript path mapping for clean imports
- **Error Handling**: Centralized error boundaries with user-friendly messages

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless** - PostgreSQL connection with WebSocket support
- **drizzle-orm** & **drizzle-kit** - Type-safe ORM and schema migrations
- **@tanstack/react-query** - Server state management and caching
- **wouter** - Lightweight React routing
- **zustand** - Minimal client state management

### UI and Styling
- **@radix-ui/react-*** - Accessible UI primitive components
- **tailwindcss** - Utility-first CSS framework
- **class-variance-authority** - Component variant management
- **lucide-react** - Consistent icon library

### Authentication and Security
- **openid-client** - OpenID Connect authentication
- **passport** - Authentication middleware
- **connect-pg-simple** - PostgreSQL session store
- **express-session** - Session management

### Development Tools
- **vite** - Frontend build tool and dev server
- **typescript** - Type safety and development experience
- **@vitejs/plugin-react** - React integration for Vite
- **esbuild** - Fast production bundling
- **tsx** - TypeScript execution for development

### Form Handling and Validation
- **react-hook-form** - Performant form management
- **@hookform/resolvers** - Validation resolver integration
- **zod** - Runtime type validation and schema definition
- **drizzle-zod** - Database schema to Zod validation bridge