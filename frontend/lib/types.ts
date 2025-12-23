export interface ProcessedResource {
  resource_type: string;
  display_name: string;
  type: string;
  status: string;
  region: string;
  size_gb?: number;
  hourly_price: number;
  cost_mtd: number;
  cost_forecast: number;
  start_time?: string;
}

export const PRICING_CATALOG: Record<string, number> = {
  't2.micro': 0.0116,
  't2.small': 0.023,
  't2.medium': 0.0464,
  't3.micro': 0.0104,
  't3.small': 0.0208,
  't3.medium': 0.0416,
  'm5.large': 0.096,
  'm5.xlarge': 0.192,
  'Standard': 0.023, // S3 Standard storage per GB/month
};

export const HOURS_PER_MONTH = 730;

export const AWS_REGIONS = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
];
