'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, RefreshCw } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { accountAPI } from '@/lib/api'
import { useAccountStore } from '@/lib/store'
import { getEC2Price, getRDSPrice, getS3PricePerGBHour } from '@/lib/pricing'
import type { Resource } from '@/types'

type SortField = 'resource_type' | 'resource_id' | 'cost_per_hour' | 'cost_current' | 'cost_mtd'

export function ResourcesTableLive() {
  const { selectedAccount } = useAccountStore()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(false)
  const [sortField, setSortField] = useState<SortField>('cost_current')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    if (selectedAccount) {
      loadResources()
    }
  }, [selectedAccount])

  const loadResources = async () => {
    if (!selectedAccount) return

    setLoading(true)
    try {
      const response = await accountAPI.getAccountResources(selectedAccount.id)
      setResources(response.data)
    } catch (error) {
      console.error('Failed to load resources:', error)
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  const calculateCostPerHour = (resource: Resource): number => {
    const detail = resource.detail

    // EC2 instances
    if (detail.instance_type) {
      const price = getEC2Price(detail.instance_type)
      // Only charge if running
      if (price > 0 && detail.state && detail.state.toLowerCase() === 'running') {
        return price
      }
      return 0
    }

    // RDS instances
    if (detail.resource_class) {
      const price = getRDSPrice(detail.resource_class)
      // Only charge if available
      if (price > 0 && detail.resource_status && detail.resource_status.toLowerCase() === 'available') {
        return price
      }
      return 0
    }

    // S3 buckets
    if (resource.resource_type === 'S3' && detail.size) {
      return detail.size * getS3PricePerGBHour()
    }

    return 0
  }

  const calculateCostCurrent = (resource: Resource): number => {
    const costPerHour = calculateCostPerHour(resource)
    const detail = resource.detail

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // For running resources, calculate based on launch time or creation time
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

    // Default: calculate from start of month to now
    const hoursSinceStartOfMonth = (now.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60)
    return costPerHour * hoursSinceStartOfMonth
  }

  const calculateCostMTD = (resource: Resource): number => {
    const costPerHour = calculateCostPerHour(resource)
    const detail = resource.detail

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // For running resources, calculate based on launch time or creation time
    if (detail.launch_time) {
      const launchTime = new Date(detail.launch_time)
      const effectiveStartTime = launchTime > startOfMonth ? launchTime : startOfMonth
      const hoursTillEndOfMonth = (endOfMonth.getTime() - effectiveStartTime.getTime()) / (1000 * 60 * 60)
      return costPerHour * hoursTillEndOfMonth
    }

    if (detail.creation_date) {
      const creationTime = new Date(detail.creation_date)
      const effectiveStartTime = creationTime > startOfMonth ? creationTime : startOfMonth
      const hoursTillEndOfMonth = (endOfMonth.getTime() - effectiveStartTime.getTime()) / (1000 * 60 * 60)
      return costPerHour * hoursTillEndOfMonth
    }

    // Default: calculate from start of month to end of month
    const totalHoursInMonth = (endOfMonth.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60)
    return costPerHour * totalHoursInMonth
  }

  const sortedResources = useMemo(() => {
    return [...resources].sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Handle cost sorting
      if (sortField === 'cost_per_hour') {
        aValue = calculateCostPerHour(a)
        bValue = calculateCostPerHour(b)
      } else if (sortField === 'cost_current') {
        aValue = calculateCostCurrent(a)
        bValue = calculateCostCurrent(b)
      } else if (sortField === 'cost_mtd') {
        aValue = calculateCostMTD(a)
        bValue = calculateCostMTD(b)
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      return 0
    })
  }, [resources, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getResourceIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'EC2':
        return '🖥️'
      case 'S3':
        return '🪣'
      case 'RDS':
        return '🗄️'
      default:
        return '📦'
    }
  }

  const getResourceStatus = (resource: Resource) => {
    const detail = resource.detail

    // EC2 instance
    if (detail.state) {
      return detail.state
    }

    // RDS instance
    if (detail.resource_status) {
      return detail.resource_status
    }

    // S3 bucket
    if (resource.resource_type === 'S3') {
      return 'Available'
    }

    return 'Unknown'
  }

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase()

    if (normalizedStatus.includes('running') || normalizedStatus.includes('available')) {
      return 'success'
    }
    if (normalizedStatus.includes('stopped') || normalizedStatus.includes('terminated')) {
      return 'secondary'
    }
    if (normalizedStatus.includes('pending') || normalizedStatus.includes('stopping')) {
      return 'warning'
    }
    return 'outline'
  }

  const getResourceName = (resource: Resource) => {
    const detail = resource.detail

    // EC2: Check for Name tag or use instance_id
    if (detail.tags && detail.tags.Name) {
      return detail.tags.Name
    }
    if (detail.instance_id) {
      return detail.instance_id
    }

    // S3: Use bucket name
    if (detail.name) {
      return detail.name
    }

    // RDS: Use resource_id from detail
    if (detail.resource_id) {
      return detail.resource_id
    }

    return resource.resource_id
  }

  const getResourceType = (resource: Resource) => {
    const detail = resource.detail

    // EC2 instance type
    if (detail.instance_type) {
      return detail.instance_type
    }

    // RDS instance class
    if (detail.resource_class) {
      return detail.resource_class
    }

    // S3 - show size
    if (resource.resource_type === 'S3' && detail.size !== undefined) {
      return `${detail.size.toFixed(2)} GB`
    }

    return resource.resource_type
  }

  if (!selectedAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ressources</CardTitle>
          <CardDescription>Sélectionnez un compte pour voir les ressources</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Ressources Actives</CardTitle>
          <CardDescription>
            {resources.length} ressource{resources.length !== 1 ? 's' : ''} trouvée{resources.length !== 1 ? 's' : ''}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadResources}
          disabled={loading}
        >
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        {loading && resources.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chargement des ressources...
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune ressource trouvée. Lancez un scan pour découvrir vos ressources.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">
                    <button
                      onClick={() => handleSort('resource_type')}
                      className="flex items-center space-x-1 hover:text-blue-600"
                    >
                      <span>Service</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4">
                    <button
                      onClick={() => handleSort('resource_id')}
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
                      onClick={() => handleSort('cost_per_hour')}
                      className="flex items-center justify-end space-x-1 hover:text-blue-600 ml-auto"
                    >
                      <span>Coût/h</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4">
                    <button
                      onClick={() => handleSort('cost_current')}
                      className={cn(
                        'flex items-center justify-end space-x-1 hover:text-blue-600 ml-auto',
                        sortField === 'cost_current' && 'text-blue-600 font-semibold'
                      )}
                    >
                      <span>Coût Actuel</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4">
                    <button
                      onClick={() => handleSort('cost_mtd')}
                      className="flex items-center justify-end space-x-1 hover:text-blue-600 ml-auto"
                    >
                      <span>Coût MTD</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedResources.map((resource) => {
                  const status = getResourceStatus(resource)
                  const costPerHour = calculateCostPerHour(resource)
                  const costCurrent = calculateCostCurrent(resource)
                  const costMTD = calculateCostMTD(resource)

                  return (
                    <tr key={resource.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{getResourceIcon(resource.resource_type)}</span>
                          <span className="font-medium text-blue-600">
                            {resource.resource_type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {getResourceName(resource)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {getResourceType(resource)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusColor(status) as any}>
                          {status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {formatCurrency(costPerHour)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-blue-600">
                        {formatCurrency(costCurrent)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-600">
                        {formatCurrency(costMTD)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
