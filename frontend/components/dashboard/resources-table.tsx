'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

interface Resource {
  id: string
  service: string
  name: string
  type: string
  status: 'Running' | 'Stopped' | 'Available'
  costPerHour: number
  costMTD: number
}

const mockResources: Resource[] = [
  { id: '1', service: 'EC2', name: 'prod-web-server-01', type: 't3.large', status: 'Running', costPerHour: 0.0832, costMTD: 59.90 },
  { id: '2', service: 'RDS', name: 'prod-db-mysql', type: 'db.t3.medium', status: 'Available', costPerHour: 0.068, costMTD: 48.96 },
  { id: '3', service: 'EC2', name: 'staging-app-01', type: 't2.micro', status: 'Running', costPerHour: 0.0116, costMTD: 8.35 },
  { id: '4', service: 'S3', name: 'backups-bucket', type: 'Standard', status: 'Available', costPerHour: 0, costMTD: 12.50 },
  { id: '5', service: 'EC2', name: 'dev-test-instance', type: 't2.small', status: 'Stopped', costPerHour: 0, costMTD: 0 },
]

type SortField = 'name' | 'service' | 'costPerHour' | 'costMTD'

export function ResourcesTable() {
  const [sortField, setSortField] = useState<SortField>('costMTD')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const sortedResources = useMemo(() => {
    return [...mockResources].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })
  }, [sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running':
        return 'success'
      case 'Stopped':
        return 'secondary'
      case 'Available':
        return 'default'
      default:
        return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ressources Actives</CardTitle>
        <CardDescription>Vue détaillée de toutes vos ressources cloud</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('service')}
                    className="flex items-center space-x-1 hover:text-blue-600"
                  >
                    <span>Service</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1 hover:text-blue-600"
                  >
                    <span>Nom</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort('costPerHour')}
                    className="flex items-center justify-end space-x-1 hover:text-blue-600 ml-auto"
                  >
                    <span>Coût/h</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleSort('costMTD')}
                    className={cn(
                      'flex items-center justify-end space-x-1 hover:text-blue-600 ml-auto',
                      sortField === 'costMTD' && 'text-blue-600 font-semibold'
                    )}
                  >
                    <span>Coût MTD</span>
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedResources.map((resource) => (
                <tr key={resource.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-blue-600">{resource.service}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold">{resource.name}</td>
                  <td className="py-3 px-4 text-gray-600">{resource.type}</td>
                  <td className="py-3 px-4">
                    <Badge variant={getStatusColor(resource.status) as any}>
                      {resource.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {formatCurrency(resource.costPerHour)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold">
                    {formatCurrency(resource.costMTD)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
