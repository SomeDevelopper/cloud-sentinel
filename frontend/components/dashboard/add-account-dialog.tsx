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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { accountAPI } from '@/lib/api'
import { useAccountStore } from '@/lib/store'
import { formatErrorMessage } from '@/lib/utils'
import { Plus, Eye, EyeOff, Loader2, CheckCircle, XCircle, Info } from 'lucide-react'

export function AddAccountDialog() {
  const [open, setOpen] = useState(false)
  const addAccount = useAccountStore((state) => state.addAccount)
  const [formData, setFormData] = useState({
    account_name: '',
    provider: 'AWS' as 'AWS' | 'AZURE' | 'GCP',
    access_key_public: '',
    secret_key: '',
    tenant_id: '',
  })
  const [showSecret, setShowSecret] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setTestResult(null)
    setError('')
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    setError('')

    try {
      const response = await accountAPI.createAccount(formData)
      const accountId = response.data.id

      await accountAPI.testConnection(accountId)
      setTestResult('success')
      addAccount(response.data)

      setTimeout(() => {
        setOpen(false)
        resetForm()
      }, 1500)
    } catch (err: any) {
      setTestResult('error')
      setError(formatErrorMessage(err) || 'Échec de la connexion')
    } finally {
      setTesting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      account_name: '',
      provider: 'AWS',
      access_key_public: '',
      secret_key: '',
      tenant_id: '',
    })
    setTestResult(null)
    setError('')
    setShowSecret(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un compte
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connecter un environnement cloud</DialogTitle>
          <DialogDescription>
            Ajoutez vos identifiants cloud pour commencer à surveiller vos ressources
          </DialogDescription>
        </DialogHeader>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start space-x-2">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <p className="text-sm text-blue-900">
            Nous recommandons de créer un utilisateur IAM avec les droits <strong>ReadOnlyAccess</strong> uniquement
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account_name">Nom du compte</Label>
            <Input
              id="account_name"
              placeholder="Production AWS"
              value={formData.account_name}
              onChange={(e) => handleChange('account_name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Fournisseur</Label>
            <Select
              value={formData.provider}
              onValueChange={(value) => handleChange('provider', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AWS">AWS</SelectItem>
                <SelectItem value="AZURE">Azure</SelectItem>
                <SelectItem value="GCP">GCP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_key">Access Key ID</Label>
            <Input
              id="access_key"
              placeholder="AKIA..."
              value={formData.access_key_public}
              onChange={(e) => handleChange('access_key_public', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret_key">Secret Access Key</Label>
            <div className="relative">
              <Input
                id="secret_key"
                type={showSecret ? 'text' : 'password'}
                placeholder="••••••••••••••••"
                value={formData.secret_key}
                onChange={(e) => handleChange('secret_key', e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {formData.provider === 'AZURE' && (
            <div className="space-y-2">
              <Label htmlFor="tenant_id">Tenant ID (optionnel)</Label>
              <Input
                id="tenant_id"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={formData.tenant_id}
                onChange={(e) => handleChange('tenant_id', e.target.value)}
              />
            </div>
          )}

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md flex items-center space-x-2">
              <XCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {testResult === 'success' && (
            <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Connexion réussie! Compte ajouté.</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={testing}>
            Annuler
          </Button>
          <Button onClick={handleTestConnection} disabled={testing || !formData.account_name || !formData.access_key_public || !formData.secret_key}>
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Test en cours...
              </>
            ) : (
              'Tester et ajouter'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
