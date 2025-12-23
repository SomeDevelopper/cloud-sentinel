from fastapi import APIRouter, Depends
from models.user import User
from core.deps import get_current_user
from uuid import UUID
from schemas.user import StandardResponse
from worker import task_scan_account, celery_app

router = APIRouter()

@router.post("/{account_id}/scan-{region}", response_model=StandardResponse)
async def scan_account(account_id: UUID, region: str, user: User = Depends(get_current_user)):
    task = task_scan_account.delay(str(account_id), str(user.user_id), region)
    return StandardResponse(
        message="Scan started successfully",
        data={"task_id": task.id}
    )

@router.get("/task/{task_id}", response_model=StandardResponse)
async def get_task_status(task_id: str, user: User = Depends(get_current_user)):
    task = celery_app.AsyncResult(task_id)
    return StandardResponse(
        message="Task status retrieved",
        data={
            "task_id": task_id,
            "state": task.state,
            "result": task.result if task.state == "SUCCESS" else None,
            "error": str(task.result) if task.state == "FAILURE" else None
        }
    )
