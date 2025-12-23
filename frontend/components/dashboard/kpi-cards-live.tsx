'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, Server, Activity } from 'lucide-react'
import { KPICard } from './kpi-card'
import { accountAPI } from '@/lib/api'
import { useAccountStore } from '@/lib/store'
import { getEC2Price, getRDSPrice, getS3PricePerGBHour } from '@/lib/pricing'
import type { Resource } from '@/types'

export function KPICardsLive() {
  const { selectedAccount } = useAccountStore()
  const [metrics, setMetrics] = useState({
    currentCost: 0,
    forecastCost: 0,
    totalResources: 0,
    runningResources: 0,
    stoppedResources: 0,
  })

  useEffect(() => {
    if (selectedAccount) {
      loadMetrics()
    }
  }, [selectedAccount])

  const calculateCostCurrent = (resource: Resource): number => {
    const detail = resource.detail
    let costPerHour = 0

    // EC2 instances
    if (detail.instance_type) {
      const price = EC2_PRICING[detail.instance_type] || 0.05
      if (detail.state && detail.state.toLowerCase() === 'running') {
        costPerHour = price
      }
    }

    // RDS instances
    if (detail.resource_class) {
      const price = RDS_PRICING[detail.resource_class] || 0.05
      if (detail.resource_status && detail.resource_status.toLowerCase() === 'available') {
        costPerHour = price
      }
    }

    // S3 buckets
    if (resource.resource_type === 'S3' && detail.size) {
      costPerHour = detail.size * S3_PRICE_PER_GB_HOUR
    }

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

  const calculateCostMTD = (resource: Resource): number => {
    const detail = resource.detail
    let costPerHour = 0

    if (detail.instance_type) {
      const price = getEC2Price(detail.instance_type)
      if (price > 0 && detail.state && detail.state.toLowerCase() === 'running') {
        costPerHour = price
      }
    }

    if (detail.resource_class) {
      const price = getRDSPrice(detail.resource_class)
      if (price > 0 && detail.resource_status && detail.resource_status.toLowerCase() === 'available') {
        costPerHour = price
      }
    }

    if (resource.resource_type === 'S3' && detail.size) {
      costPerHour = detail.size * getS3PricePerGBHour()
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

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

    const totalHoursInMonth = (endOfMonth.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60)
    return costPerHour * totalHoursInMonth
  }

  const loadMetrics = async () => {
    if (!selectedAccount) return

    try {
      const response = await accountAPI.getAccountResources(selectedAccount.id)
      const resources = response.data

      let totalCostCurrent = 0
      let totalCostMTD = 0
      let runningCount = 0
      let stoppedCount = 0

      resources.forEach((resource) => {
        totalCostCurrent += calculateCostCurrent(resource)
        totalCostMTD += calculateCostMTD(resource)

        const detail = resource.detail
        if (detail.state) {
          if (detail.state.toLowerCase() === 'running') runningCount++
          else if (detail.state.toLowerCase() === 'stopped') stoppedCount++
        } else if (detail.resource_status) {
          if (detail.resource_status.toLowerCase() === 'available') runningCount++
        } else if (resource.resource_type === 'S3') {
          runningCount++
        }
      })

      setMetrics({
        currentCost: totalCostCurrent,
        forecastCost: totalCostMTD,
        totalResources: resources.length,
        runningResources: runningCount,
        stoppedResources: stoppedCount,
      })
    } catch (error) {
      console.error('Failed to load metrics:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  const healthScore = metrics.totalResources > 0
    ? Math.round((metrics.runningResources / metrics.totalResources) * 100)
    : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Coût Actuel"
        value={formatCurrency(metrics.currentCost)}
        subtitle="Du 1er à aujourd'hui"
        icon={DollarSign}
      />
      <KPICard
        title="Prévision Fin de Mois"
        value={formatCurrency(metrics.forecastCost)}
        subtitle="Si les ressources restent actives"
        icon={TrendingUp}
        className="border-orange-200"
      />
      <KPICard
        title="Ressources Actives"
        value={metrics.totalResources.toString()}
        subtitle={`${metrics.runningResources} Running · ${metrics.stoppedResources} Stopped`}
        icon={Server}
      />
      <KPICard
        title="Health Score"
        value={`${healthScore}%`}
        subtitle={
          healthScore === 100
            ? 'Toutes les ressources opérationnelles'
            : `${metrics.runningResources}/${metrics.totalResources} ressources actives`
        }
        icon={Activity}
        className="border-green-200"
      />
    </div>
  )
}
