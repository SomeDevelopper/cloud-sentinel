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
            raise ValueError(f"AWS Error while scanning EC2 instances: {e}")
        except Exception as e:
            raise ValueError(f"Error scanning EC2 instances: {e}")