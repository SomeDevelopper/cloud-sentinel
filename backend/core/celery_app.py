from core.config import CELERY_BROKER_URL, CELERY_RESULT_BACKEND
from celery import Celery


# 2. On instancie l'application Celery
celery_app = Celery(
    "cloud_sentinel_worker",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND
)

# 3. Configuration pour éviter les bugs de sérialisation
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Important : On dira à Celery où chercher les tâches plus tard
    include=["worker"] 
)