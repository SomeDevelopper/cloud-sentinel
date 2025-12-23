'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const mockData = [
  { service: 'EC2', cost: 1245.50 },
  { service: 'RDS', cost: 850.30 },
  { service: 'S3', cost: 320.75 },
  { service: 'Lambda', cost: 180.20 },
  { service: 'CloudFront', cost: 210.40 },
  { service: 'ELB', cost: 165.90 },
]

export function CostChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Coût par Service</CardTitle>
        <CardDescription>Répartition des coûts mensuels par service AWS</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockData}>
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
      </CardContent>
    </Card>
  )
}
