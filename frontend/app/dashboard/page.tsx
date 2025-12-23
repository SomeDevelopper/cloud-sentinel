'use client'

import { KPICardsLive } from '@/components/dashboard/kpi-cards-live'
import { CostChartLive } from '@/components/dashboard/cost-chart-live'
import { RegionChartLive } from '@/components/dashboard/region-chart-live'
import { ResourcesTableLive } from '@/components/dashboard/resources-table-live'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vue d'ensemble</h1>
        <p className="text-gray-600 mt-1">
          Surveillez vos ressources cloud et optimisez vos coûts
        </p>
      </div>

      {/* KPI Cards */}
      <KPICardsLive />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CostChartLive />
        <RegionChartLive />
      </div>

      {/* Resources Table */}
      <ResourcesTableLive />
    </div>
  )
}
