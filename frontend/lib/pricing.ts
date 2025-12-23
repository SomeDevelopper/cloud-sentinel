// AWS Pricing Configuration
export const AWS_PRICING = {
  ec2: {
    't2.micro': 0.0116,
    't3.micro': 0.0104,
    't3.medium': 0.0416,
    'm5.large': 0.107,
  },
  rds: {
    'db.t3.micro': 0.018,
    'db.t3.medium': 0.072,
    'db.m5.large': 0.154,
  },
  s3: {
    standard_gb: 0.023, // per GB per month
  },
} as const

// Calculate S3 price per GB per hour (monthly price / ~730 hours)
export const S3_PRICE_PER_GB_HOUR = AWS_PRICING.s3.standard_gb / 730

export function getEC2Price(instanceType: string): number {
  return AWS_PRICING.ec2[instanceType as keyof typeof AWS_PRICING.ec2] || 0
}

export function getRDSPrice(instanceClass: string): number {
  return AWS_PRICING.rds[instanceClass as keyof typeof AWS_PRICING.rds] || 0
}

export function getS3PricePerGBHour(): number {
  return S3_PRICE_PER_GB_HOUR
}
