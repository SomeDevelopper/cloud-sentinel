'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { scanAPI } from '@/lib/api'
import { formatErrorMessage } from '@/lib/utils'
import { Play, Loader2, CheckCircle, XCircle } from 'lucide-react'

interface ScanDialogProps {
  accountId: string
  accountName: string
}

const AWS_REGIONS = [
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-west-1', label: 'US West (N. California)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'eu-west-1', label: 'EU (Ireland)' },
  { value: 'eu-west-3', label: 'EU (Paris)' },
  { value: 'eu-central-1', label: 'EU (Frankfurt)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
]

export function ScanDialog({ accountId, accountName }: ScanDialogProps) {
  const [open, setOpen] = useState(false)
  const [region, setRegion] = useState('eu-west-3')
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null)
  const [error, setError] = useState('')
  const [taskId, setTaskId] = useState<string | null>(null)

  const handleScan = async () => {
    setScanning(true)
    setScanResult(null)
    setError('')
    setTaskId(null)

    try {
      const response = await scanAPI.startScan(accountId, region)
      setTaskId(response.data.task_id)
      setScanResult('success')

      // Auto-close after showing success
      setTimeout(() => {
        setOpen(false)
        resetForm()
        // Optionally refresh the resources list here
        window.location.reload()
      }, 2000)
    } catch (err: any) {
      setScanResult('error')
      setError(formatErrorMessage(err) || 'Échec du scan')
    } finally {
      setScanning(false)
    }
  }

  const resetForm = () => {
    setRegion('eu-west-3')
    setScanResult(null)
    setError('')
    setTaskId(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Play className="w-4 h-4 mr-2" />
          Lancer un scan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Lancer un scan de ressources</DialogTitle>
          <DialogDescription>
            Scanner les ressources AWS pour le compte: <strong>{accountName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="region">Région AWS</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AWS_REGIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-900">
              Le scan va détecter les ressources EC2, S3 et RDS dans la région sélectionnée.
              Cette opération peut prendre quelques minutes.
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md flex items-center space-x-2">
              <XCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {scanResult === 'success' && taskId && (
            <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <div>
                <p className="font-semibold">Scan lancé avec succès!</p>
                <p className="text-xs mt-1">Task ID: {taskId}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={scanning}>
            Annuler
          </Button>
          <Button onClick={handleScan} disabled={scanning}>
            {scanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scan en cours...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Démarrer le scan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
