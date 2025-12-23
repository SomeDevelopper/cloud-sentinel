'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { accountAPI } from '@/lib/api'
import { useAccountStore } from '@/lib/store'
import { getEC2Price, getRDSPrice, getS3PricePerGBHour } from '@/lib/pricing'
import type { Resource } from '@/types'

export function CostChartLive() {
  const { selectedAccount } = useAccountStore()
  const [chartData, setChartData] = useState<{ service: string; cost: number }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedAccount) {
      loadData()
    }
  }, [selectedAccount])

  const calculateCostCurrent = (resource: Resource): number => {
    const detail = resource.detail
    let costPerHour = 0

    // EC2 instances
    if (detail.instance_type) {
      const price = getEC2Price(detail.instance_type)
      if (price > 0 && detail.state && detail.state.toLowerCase() === 'running') {
        costPerHour = price
      }
    }

    // RDS instances
    if (detail.resource_class) {
      const price = getRDSPrice(detail.resource_class)
      if (price > 0 && detail.resource_status && detail.resource_status.toLowerCase() === 'available') {
        costPerHour = price
      }
    }

    // S3 buckets
    if (resource.resource_type === 'S3' && detail.size) {
      costPerHour = detail.size * getS3PricePerGBHour()
    }

    // Calculate current cost (from start of month to now)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    if (detail.launch_time) {
      const launchTime = new Date(detail.launch_time)
      const effectiveStartTime = launchTime > startOfMonth ? launchTime : startOfMonth
      const hoursRunning = (now.getTime() - effectiveStartTime.getTime()) / (1000 * 60 * 60)
      return costPerHour * hoursRunning
    }

    if (detail.creation_date) {
      const creationTime = new Date(detail.creation_date)
      const effectiveStartTime = creationTime > startOfMonth ? creationTime : startOfMonth
      const hoursExisting = (now.getTime() - effectiveStartTime.getTime()) / (1000 * 60 * 60)
      return costPerHour * hoursExisting
    }

    const hoursSinceStartOfMonth = (now.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60)
    return costPerHour * hoursSinceStartOfMonth
  }

  const loadData = async () => {
    if (!selectedAccount) return

    setLoading(true)
    try {
      const response = await accountAPI.getAccountResources(selectedAccount.id)
      const resources = response.data

      // Group by service type and sum costs
      const costByService: Record<string, number> = {}

      resources.forEach((resource) => {
        const service = resource.resource_type
        const cost = calculateCostCurrent(resource)

        if (costByService[service]) {
          costByService[service] += cost
        } else {
          costByService[service] = cost
        }
      })

      // Convert to chart data format
      const data = Object.entries(costByService)
        .map(([service, cost]) => ({
          service,
          cost: Number(cost.toFixed(2)),
        }))
        .sort((a, b) => b.cost - a.cost)

      setChartData(data)
    } catch (error) {
      console.error('Failed to load cost data:', error)
      setChartData([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coût par Service</CardTitle>
        <CardDescription>Répartition des coûts actuels par service AWS (du 1er à aujourd'hui)</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            Chargement des données...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            Aucune donnée disponible. Lancez un scan pour voir les coûts.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="service" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
              />
              <Bar dataKey="cost" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
