import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from fastapi import HTTPException, status

class AwsService():
    def __init__(self, access_key: str, secret_key: str, region: str):
        self.session = boto3.Session(
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region
        )

    def test_connectivity(self):
        sts_client = self.session.client('sts')
        try:
            account_infos = sts_client.get_caller_identity()
            return account_infos
        except ClientError as e:
            raise ValueError(f"AWS Error: {e}")
        except NoCredentialsError as e:
            raise ValueError("Invalid Credentials")