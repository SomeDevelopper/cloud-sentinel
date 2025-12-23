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
        buckets = aws_service.scan_s3_bucket()
        rds_instances = aws_service.scan_rds_instance()

        # Delete old resources
        db.query(CloudResource).filter(
            CloudResource.cloud_account_id == UUID(account_id),
            CloudResource.resource_type == 'ec2_instance',
            CloudResource.region == region
        ).delete()
        db.query(CloudResource).filter(
            CloudResource.cloud_account_id == UUID(account_id),
            CloudResource.resource_type == 'rds_instance',
            CloudResource.region == region
        ).delete()
        db.query(CloudResource).filter(
            CloudResource.cloud_account_id == UUID(account_id),
            CloudResource.resource_type == 's3_bucket'
        ).delete()

        new_resources = []
        # Add EC2 instances
        for instance in instances:
            instance_resource = CloudResource(
                cloud_account_id=UUID(account_id),
                resource_type='ec2_instance',
                resource_id=instance.get('instance_id'),
                region=region,
                detail=instance
            )
            new_resources.append(instance_resource)

        # Add S3 buckets
        for bucket in buckets:
            bucket_resource = CloudResource(
                cloud_account_id=UUID(account_id),
                resource_type='s3_bucket',
                resource_id=bucket.get('resource_id'),
                region=bucket.get('region'),
                detail=bucket
            )
            new_resources.append(bucket_resource)

        # Add RDS instances
        for rds_instance in rds_instances:
            rds_resource = CloudResource(
                cloud_account_id=UUID(account_id),
                resource_type='rds_instance',
                resource_id=rds_instance.get('resource_id'),
                region=rds_instance.get('region'),
                detail=rds_instance
            )
            new_resources.append(rds_resource)

        db.add_all(new_resources)
        db.commit()
        return f"Scan finished: {len(new_resources)} resources saved."
    except Exception as e:
        db.rollback()
        print(f"Error in worker: {e}")
        raise
    finally:
        db.close()