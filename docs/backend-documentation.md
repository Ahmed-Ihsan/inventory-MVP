# Inventory Management Backend Documentation

## Table of Contents

1. [Overview](#overview)
2. [Setup and Installation](backend-setup.md)
3. [Architecture Overview](backend-architecture.md)
4. [API Documentation](backend-api-documentation.md)
5. [File Structure](backend-file-structure.md)
6. [Development Tasks](backend-tasks.md)
7. [Features](features.md)
8. [Alerts Implementation](alerts-implementation.md)

## Overview

The Inventory Management backend is a comprehensive REST API built with FastAPI that provides complete inventory management functionality for small to medium businesses. The system supports item catalog management, real-time stock tracking, barcode scanning integration, alert management, and payment processing.

### Key Features

- **Item Management**: Complete CRUD operations for inventory items with categorization
- **Stock Tracking**: Real-time stock level monitoring and movement history
- **Barcode Scanning**: Image-based barcode/QR code scanning for quick inventory updates
- **Alert System**: Automated low-stock alerts and manual alert management
- **Payment Processing**: Sales and purchase payment tracking with status management
- **Authentication**: JWT-based user authentication and authorization
- **RESTful API**: Well-documented endpoints with automatic interactive documentation

### Technology Stack

- **Framework**: FastAPI (Python async web framework)
- **Database**: SQLAlchemy ORM with SQLite (easily configurable for PostgreSQL/MySQL)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Pydantic for request/response validation
- **Migrations**: Alembic for database schema management
- **Testing**: pytest for comprehensive test coverage
- **Documentation**: Auto-generated OpenAPI/Swagger documentation

### Architecture Principles

The backend follows clean architecture principles with clear separation of concerns:

- **Presentation Layer**: FastAPI routers handling HTTP requests/responses
- **Service Layer**: Business logic encapsulation
- **Data Layer**: SQLAlchemy models and database operations
- **Configuration Layer**: Centralized settings management

### Getting Started

To get started with the backend:

1. Follow the [Setup and Installation Guide](backend-setup.md)
2. Review the [Architecture Overview](backend-architecture.md)
3. Explore the [API Documentation](backend-api-documentation.md)
4. Check the [File Structure](backend-file-structure.md) for codebase organization

### Development

The project includes comprehensive testing and follows development best practices:

- Unit and integration tests
- Code formatting and linting
- Database migrations
- Environment-based configuration

### API Access

Once running, the API provides:

- **Base URL**: `http://localhost:8000`
- **Interactive Docs**: `http://localhost:8000/docs` (Swagger UI)
- **Alternative Docs**: `http://localhost:8000/redoc` (ReDoc)

### Database

The system uses SQLite by default for simplicity, but can be easily configured for production databases. The schema includes tables for users, items, categories, stock movements, alerts, and payments with proper relationships and constraints.

### Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration for frontend integration

### Extensibility

The modular architecture makes it easy to add new features:

- New API endpoints
- Additional business logic
- Database schema extensions
- Third-party integrations

## Contributing

When contributing to the backend:

1. Follow the existing code patterns and architecture
2. Add appropriate tests for new functionality
3. Update documentation as needed
4. Use type hints and follow PEP 8 standards

## License

[Add license information here]

---

For detailed information about specific components, please refer to the linked documentation files above.
