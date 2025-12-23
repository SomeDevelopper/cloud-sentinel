import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from datetime import datetime, timedelta

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
        
    def scan_ec2_instances(self):
        ec2_client = self.session.client('ec2')
        try:
            res = ec2_client.describe_instances()
            instances = []

            for reservation in res.get('Reservations', []):
                for instance in reservation.get('Instances', []):
                    instance_info = {
                        'instance_id': instance.get('InstanceId'),
                        'instance_type': instance.get('InstanceType'),
                        'state': instance.get('State', {}).get('Name'),
                        'state_code': instance.get('State', {}).get('Code'),
                        'architecture': instance.get('Architecture'),
                        'launch_time': instance.get('LaunchTime').isoformat() if instance.get('LaunchTime') else None,
                        'availability_zone': instance.get('Placement', {}).get('AvailabilityZone'),
                        'vpc_id': instance.get('VpcId'),
                        'subnet_id': instance.get('SubnetId'),
                        'private_ip_address': instance.get('PrivateIpAddress'),
                        'public_ip_address': instance.get('PublicIpAddress'),
                        'private_dns_name': instance.get('PrivateDnsName'),
                        'public_dns_name': instance.get('PublicDnsName'),
                        'key_name': instance.get('KeyName'),
                        'security_groups': [
                            {'group_id': sg.get('GroupId'), 'group_name': sg.get('GroupName')}
                            for sg in instance.get('SecurityGroups', [])
                        ],
                        'iam_instance_profile': instance.get('IamInstanceProfile', {}).get('Arn'),
                        'monitoring': instance.get('Monitoring', {}).get('State'),
                        'tags': {tag.get('Key'): tag.get('Value') for tag in instance.get('Tags', [])},
                        'platform': instance.get('PlatformDetails'),
                        'ebs_optimized': instance.get('EbsOptimized'),
                        'root_device_type': instance.get('RootDeviceType'),
                        'virtualization_type': instance.get('VirtualizationType')
                    }
                    instances.append(instance_info)
            return instances
        except ClientError as e:
            raise ValueError(f"AWS Error while scanning EC2 instances :: {e}")
        except Exception as e:
            raise ValueError(f"Error scanning EC2 instances :: {e}")


    def scan_s3_bucket(self):
        s3_client = self.session.client('s3')

        try:
            res_bucket = s3_client.list_buckets()
            buckets = list()
            for bucket in res_bucket.get('Buckets', []):
                size_bytes = self.get_s3_bucket_size(bucket_name=bucket.get('Name'), region=self.session.region_name)
                size_gb = size_bytes / (1024 ** 3)
                buckets.append({
                    'resource_id': bucket.get('Name'),
                    'name': bucket.get('Name'),
                    'creation_date': bucket.get('CreationDate').isoformat() if bucket.get('CreationDate') else None,
                    'region': bucket.get('BucketRegion', 'global'),
                    'size' : size_gb,
                    'arn': bucket.get('BucketArn', f"arn:aws:s3:::{bucket.get('Name')}")
                })
            return buckets
        except ClientError as e:
            raise ValueError(f"AWS Error while scanning S3 buckets :: {e}")
        except Exception as e:
            raise ValueError(f"Error scanning S3 buckets :: {e}")

    def scan_rds_instance(self):
        rds_client = self.session.client('rds')
        try:
            res = rds_client.describe_db_instances()
            instances_list = list()
            for instance in res.get('DBInstances', []):
                instances_list.append({
                    'resource_id': instance.get('DBInstanceIdentifier'),
                    'resource_class': instance.get('DBInstanceClass'),
                    'engine': instance.get('Engine'),
                    'resource_status': instance.get('DBInstanceStatus'),
                    'allocated_storage': instance.get('AllocatedStorage'),
                    'address': instance.get('Endpoint', {}).get('Address'),
                    'creation_date': instance.get('InstanceCreateTime').isoformat() if instance.get('InstanceCreateTime') else None,
                    'storage_type': instance.get('StorageType'),
                    'region': self.session.region_name
                })
            return instances_list
        except ClientError as e:
            raise ValueError(f"AWS Error while scanning RDS instances :: {e}")
        except Exception as e:
            raise ValueError(f"AWS Error while scanning RDS instances :: {e}")


    def get_s3_bucket_size(self, bucket_name: str, region = 'eu-west-3'):
        cw_client = self.session.client('cloudwatch')
        now = datetime.now()
        try:
            res = cw_client.get_metric_statistics(
                Namespace='AWS/S3',
                MetricName='BucketSizeBytes',
                Dimensions=[
                    {'Name': 'BucketName', 'Value': bucket_name},
                    {'Name': 'StorageType', 'Value': 'StandardStorage'}
                ],
                StartTime=  now - timedelta(days=2),
                EndTime=now,
                Period=86400,
                Statistics=['Average', 'Maximum']
            )
            datapoint = res.get('Datapoints')
            if datapoint:
                return datapoint[-1]['Average']
            return 0.0
        except ClientError as e:
            raise ValueError(f"AWS Error while scanning S3 bucket size for bucket {bucket_name}:: {e}")
        except Exception as e:
            raise ValueError(f"AWS Error while scanning S3 bucket size for bucket {bucket_name} :: {e}")