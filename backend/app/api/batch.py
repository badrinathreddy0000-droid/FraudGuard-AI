import io
import csv
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User
from app.auth.dependencies import get_current_user
from app.services.batch_service import BatchService

router = APIRouter(prefix="/batch", tags=["Batch Evaluation"])

@router.post("/upload")
async def upload_batch_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Uploads and evaluates a CSV file of transactions."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a CSV format."
        )

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    try:
        summary = BatchService.process_csv(
            file_contents=content,
            db=db,
            actor_email=current_user.email
        )
        return summary
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error evaluating batch: {str(e)}"
        )

@router.get("/sample-csv")
def download_sample_csv():
    """Returns a downloadable sample CSV formatted with IEEE-CIS features."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["transaction_id", "TransactionAmt", "ProductCD", "card4", "card6", "P_emaildomain", "C1", "dist1"])
    writer.writerow(["TX-SMP-001", 45.00, "W", "visa", "debit", "gmail.com", 1.0, 5.0])
    writer.writerow(["TX-SMP-002", 4200.00, "C", "mastercard", "credit", "protonmail.com", 15.0, 1200.0])
    writer.writerow(["TX-SMP-003", 1.25, "C", "discover", "credit", "tempmail.com", 25.0, 0.0])
    writer.writerow(["TX-SMP-004", 120.50, "W", "visa", "credit", "yahoo.com", 2.0, 45.0])
    writer.writerow(["TX-SMP-005", 850.00, "R", "mastercard", "debit", "mail.com", 8.0, 600.0])

    content = output.getvalue()
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=fraudguard_sample_transactions.csv"}
    )
