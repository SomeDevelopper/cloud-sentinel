import { CloudResource } from './api';
import { ProcessedResource, PRICING_CATALOG, HOURS_PER_MONTH } from './types';

export function processResources(rawResources: CloudResource[]): ProcessedResource[] {
  return rawResources.map(resource => {
    const detail = resource.detail || {};

    // Extract name from various sources
    const tags = detail.tags as Record<string, string> | undefined;
    const name = tags?.Name || detail.name || resource.resource_id;

    // Determine type
    const instanceType = detail.instance_type || detail.resource_class || 'Standard';

    // Determine status
    const rawStatus = detail.state || detail.resource_status || 'active';
    const status = String(rawStatus).toLowerCase();

    // Get size for S3
    const sizeGb = detail.size ? Number(detail.size) : 0;

    // Get start time
    const startTime = detail.launch_time || detail.creation_date;

    // Calculate costs
    const { hourlyPrice, costForecast, costMtd } = calculateCosts({
      type: String(instanceType),
      status,
      sizeGb,
      startTime: startTime ? String(startTime) : undefined,
    });

    return {
      resource_type: resource.resource_type,
      display_name: String(name),
      type: String(instanceType),
      status,
      region: resource.region || 'N/A',
      size_gb: sizeGb,
      hourly_price: hourlyPrice,
      cost_mtd: costMtd,
      cost_forecast: costForecast,
      start_time: startTime ? String(startTime) : undefined,
    };
  });
}

interface CostCalculationInput {
  type: string;
  status: string;
  sizeGb: number;
  startTime?: string;
}

interface CostCalculationResult {
  hourlyPrice: number;
  costForecast: number;
  costMtd: number;
}

function calculateCosts(input: CostCalculationInput): CostCalculationResult {
  const { type, status, sizeGb, startTime } = input;

  const hourlyPriceFromCatalog = PRICING_CATALOG[type] || 0;
  const inactiveStates = ['stopped', 'terminated', 'stopping'];

  let monthlyForecast = 0;
  let hourlyPrice = hourlyPriceFromCatalog;

  // S3 calculation (Standard type)
  if (type === 'Standard') {
    monthlyForecast = sizeGb * PRICING_CATALOG['Standard'];
    hourlyPrice = monthlyForecast / HOURS_PER_MONTH;
  }
  // EC2/RDS calculation
  else if (!inactiveStates.includes(status)) {
    monthlyForecast = hourlyPriceFromCatalog * HOURS_PER_MONTH;
  }

  // Calculate MTD (Month To Date)
  let mtdCost = 0;

  if (type === 'Standard') {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysElapsed = Math.floor((now.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    mtdCost = monthlyForecast * (daysElapsed / 30);
  } else if (startTime && hourlyPriceFromCatalog > 0) {
    try {
      const startDt = new Date(startTime);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const billingStart = startDt > startOfMonth ? startDt : startOfMonth;

      if (now > billingStart) {
        const hoursRun = (now.getTime() - billingStart.getTime()) / (1000 * 60 * 60);
        mtdCost = hoursRun * hourlyPriceFromCatalog;
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }

  return {
    hourlyPrice,
    costForecast: monthlyForecast,
    costMtd: mtdCost,
  };
}

export function aggregateCosts(resources: ProcessedResource[]) {
  const totalForecast = resources.reduce((sum, r) => sum + r.cost_forecast, 0);
  const totalMtd = resources.reduce((sum, r) => sum + r.cost_mtd, 0);

  return {
    totalForecast,
    totalMtd,
    totalResources: resources.length,
  };
}

export function groupByResourceType(resources: ProcessedResource[]) {
  const grouped = resources.reduce((acc, resource) => {
    const type = resource.resource_type;
    if (!acc[type]) {
      acc[type] = {
        count: 0,
        totalCost: 0,
      };
    }
    acc[type].count += 1;
    acc[type].totalCost += resource.cost_forecast;
    return acc;
  }, {} as Record<string, { count: number; totalCost: number }>);

  return Object.entries(grouped).map(([name, data]) => ({
    name,
    count: data.count,
    totalCost: data.totalCost,
  }));
}
