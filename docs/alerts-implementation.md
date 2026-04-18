# Alerts Implementation Documentation

## Overview
This document summarizes the implementation of the Alerts functionality in the Inventory Management system. The Alerts feature enables tracking and managing low stock notifications and other inventory-related alerts.

## Database Schema

### Alert Table
The `alerts` table is defined in `backend/app/models/alert.py` with the following fields:

- `id`: Primary key (Integer)
- `item_id`: Foreign key to Items table (Integer)
- `alert_type`: Type of alert (String) - e.g., 'low_stock', 'out_of_stock'
- `message`: Alert description (String)
- `is_active`: Whether the alert is active (Boolean, default: True)
- `created_at`: When the alert was created (DateTime, default: UTC now)
- `resolved_at`: When the alert was resolved (DateTime, nullable)

### Relationship
- The Alert model has a relationship to the Item model through `item_id`

## API Endpoints

The Alerts functionality exposes the following RESTful endpoints in `backend/app/routers/alerts.py`:

### Get All Active Alerts
- **Endpoint**: `GET /alerts/`
- **Response**: List of active alerts
- **Description**: Retrieves all currently active alerts

### Get Specific Alert
- **Endpoint**: `GET /alerts/{alert_id}`
- **Response**: Single alert object
- **Description**: Retrieves a specific alert by ID

### Create New Alert
- **Endpoint**: `POST /alerts/`
- **Request Body**: AlertCreate schema
- **Response**: Created alert object
- **Status**: 201 Created
- **Description**: Creates a new alert in the system

### Update Alert
- **Endpoint**: `PUT /alerts/{alert_id}`
- **Request Body**: AlertUpdate schema
- **Response**: Updated alert object
- **Description**: Updates an alert (typically to resolve it)

### Delete Alert
- **Endpoint**: `DELETE /alerts/{alert_id}`
- **Status**: 204 No Content
- **Description**: Deletes an alert from the system

## Data Models

### AlertBase Schema
```python
class AlertBase(BaseModel):
    item_id: int
    alert_type: str
    message: str
    is_active: bool = True
```

### AlertCreate Schema
```python
class AlertCreate(AlertBase):
    pass
```

### AlertUpdate Schema
```python
class AlertUpdate(BaseModel):
    is_active: Optional[bool] = None
    resolved_at: Optional[datetime] = None
```

### Alert Schema (Response)
```python
class Alert(AlertBase):
    id: int
    created_at: datetime
    resolved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
```

## Service Layer

The `AlertService` class in `backend/app/services/alert_service.py` provides the business logic:

### Core Methods
- `get_active_alerts()`: Returns all active alerts
- `get_alert(id)`: Retrieves a specific alert
- `create_alert(alert_data)`: Creates a new alert
- `update_alert(id, update_data)`: Updates an alert
- `delete_alert(id)`: Deletes an alert

### Special Method
- `check_and_create_low_stock_alerts(item_id)`: 
  - Checks if an item is below minimum stock level
  - Creates a low stock alert if needed
  - Prevents duplicate alerts for the same item

## Integration

### FastAPI Application
The alerts router is included in the main FastAPI application (`backend/app/main.py`):
- Imported as `alerts`
- Registered with prefix `/alerts`
- Tagged as "alerts"

### Database Setup
- The Alert model is included in table creation
- All models are properly registered with SQLAlchemy

## Usage Example

### Creating a Low Stock Alert
```python
# After updating item stock
alert_service = AlertService(db)
alert_service.check_and_create_low_stock_alerts(item_id)
```

### Resolving an Alert
```python
# Update the alert to mark as resolved
update_data = AlertUpdate(is_active=False)
updated_alert = alert_service.update_alert(alert_id, update_data)
```

## Future Enhancements

1. **Email Notifications**: Integrate email service to send alerts
2. **Push Notifications**: Implement real-time notifications
3. **Alert Rules**: Configurable alert thresholds and types
4. **Alert History**: Enhanced tracking of alert lifecycle
5. **Bulk Operations**: Batch alert management capabilities

## Testing

The Alerts functionality should be tested with:
- Unit tests for the service layer
- Integration tests for API endpoints
- Alert creation and resolution scenarios
- Edge cases (duplicate alerts, invalid data, etc.)

## Related Files

- `backend/app/models/alert.py` - Database model
- `backend/app/schemas/alert.py` - Pydantic schemas
- `backend/app/routers/alerts.py` - API endpoints
- `backend/app/services/alert_service.py` - Business logic
- `backend/app/main.py` - Application integration