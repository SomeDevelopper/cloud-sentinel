from core.celery_app import celery_app
from services.aws_service import AwsService
from db.database import SessionLocal
from services.cloud_account_service import CloudAccountService
from uuid import UUID
from models.resources import CloudResource

@celery_app.task
def task_scan_account(account_id: str, user_id: str, region: str):
    try:
        db = SessionLocal()
        cloud_account_service = CloudAccountService(db)
        credentials = cloud_account_service.get_credentials_account(UUID(user_id), UUID(account_id))
        aws_service = AwsService(credentials['access_key_public'], credentials['secret_key'], region=region)
        instances = aws_service.scan_ec2_instances()
        db.query(CloudResource).filter(
            CloudResource.cloud_account_id == UUID(account_id),
            CloudResource.resource_type == 'ec2_instance'
        ).delete()
        new_resources = []
        for instance in instances:
            resource = CloudResource(
                cloud_account_id=UUID(account_id),
                resource_type='ec2_instance',
                resource_id=instance.get('instance_id'),
                region=region,
                detail=instance
            )
            new_resources.append(resource)
        db.add_all(new_resources)
        db.commit()
        return f"Scan finished: {len(new_resources)} EC2 instances saved."
    except Exception as e:
        db.rollback() # Important en cas d'erreur
        print(f"Error in worker: {e}")
    finally:
        db.close()