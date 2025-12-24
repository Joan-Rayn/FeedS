from fastapi import APIRouter, Depends, HTTPException
from sse_starlette.sse import EventSourceResponse
from ..utils.auth import get_current_active_user
from ..core.database import get_db
from sqlalchemy.orm import Session
from ..models import Notification
import asyncio
import json

router = APIRouter()

# In-memory storage for SSE connections (in production, use Redis)
active_connections = {}

@router.get("/sse/{user_id}")
async def sse_endpoint(user_id: int, current_user = Depends(get_current_active_user)):
    """Server-Sent Events endpoint for real-time notifications"""
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    async def event_generator():
        # Send initial connection message
        yield {
            "event": "connected",
            "data": json.dumps({"message": "Connected to notification stream"})
        }

        # Store connection
        if user_id not in active_connections:
            active_connections[user_id] = []
        active_connections[user_id].append(asyncio.Queue())

        try:
            queue = active_connections[user_id][-1]
            while True:
                # Wait for new notification
                notification = await queue.get()
                yield {
                    "event": "notification",
                    "data": json.dumps(notification)
                }
        except asyncio.CancelledError:
            # Remove connection on disconnect
            if user_id in active_connections:
                active_connections[user_id].remove(queue)
                if not active_connections[user_id]:
                    del active_connections[user_id]

    return EventSourceResponse(event_generator())

async def send_notification_to_user(user_id: int, notification_data: dict):
    """Send notification to specific user via SSE"""
    if user_id in active_connections:
        for queue in active_connections[user_id]:
            try:
                await queue.put(notification_data)
            except:
                # Remove dead connections
                active_connections[user_id].remove(queue)

@router.post("/broadcast/{user_id}")
async def broadcast_notification(
    user_id: int,
    notification: dict,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Broadcast notification to user (admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can broadcast notifications")

    # Save notification to database
    db_notification = Notification(
        user_id=user_id,
        title=notification.get("title", "Notification"),
        message=notification.get("message", "")
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)

    # Send via SSE
    await send_notification_to_user(user_id, {
        "id": db_notification.id,
        "title": db_notification.title,
        "message": db_notification.message,
        "created_at": db_notification.created_at.isoformat()
    })

    return {"message": "Notification sent"}