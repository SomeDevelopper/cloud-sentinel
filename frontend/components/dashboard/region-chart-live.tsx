'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { accountAPI } from '@/lib/api'
import { useAccountStore } from '@/lib/store'

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4']

export function RegionChartLive() {
  const { selectedAccount } = useAccountStore()
  const [chartData, setChartData] = useState<{ name: string; value: number; color: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedAccount) {
      loadData()
    }
  }, [selectedAccount])

  const loadData = async () => {
    if (!selectedAccount) return

    setLoading(true)
    try {
      const response = await accountAPI.getAccountResources(selectedAccount.id)
      const resources = response.data

      // Group by region and count
      const resourcesByRegion: Record<string, number> = {}

      resources.forEach((resource) => {
        const region = resource.region || 'unknown'

        if (resourcesByRegion[region]) {
          resourcesByRegion[region] += 1
        } else {
          resourcesByRegion[region] = 1
        }
      })

      // Convert to chart data format
      const data = Object.entries(resourcesByRegion)
        .map(([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length],
        }))
        .sort((a, b) => b.value - a.value)

      setChartData(data)
    } catch (error) {
      console.error('Failed to load region data:', error)
      setChartData([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition par Région</CardTitle>
        <CardDescription>Distribution des ressources actives par région</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            Chargement des données...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            Aucune donnée disponible. Lancez un scan pour voir les régions.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
