'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const mockData = [
  { name: 'eu-west-3', value: 65, color: '#3b82f6' },
  { name: 'us-east-1', value: 20, color: '#8b5cf6' },
  { name: 'ap-southeast-1', value: 10, color: '#ec4899' },
  { name: 'eu-central-1', value: 5, color: '#10b981' },
]

export function RegionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition par Région</CardTitle>
        <CardDescription>Distribution des ressources actives par région</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={mockData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {mockData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
