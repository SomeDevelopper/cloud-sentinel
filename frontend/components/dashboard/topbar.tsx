'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore, useAccountStore } from '@/lib/store'
import { accountAPI } from '@/lib/api'
import { LogOut, CheckCircle2, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AddAccountDialog } from './add-account-dialog'
import { ScanDialog } from './scan-dialog'

export function Topbar() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const { accounts, selectedAccount, setAccounts, setSelectedAccount } = useAccountStore()
  const [systemStatus, setSystemStatus] = useState<'operational' | 'degraded'>('operational')

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await accountAPI.listAccounts()
        setAccounts(response.data)
        if (response.data.length > 0 && !selectedAccount) {
          setSelectedAccount(response.data[0])
        }
      } catch (error) {
        console.error('Failed to load accounts:', error)
      }
    }
    loadAccounts()
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Account Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Compte:</span>
            {accounts.length > 0 ? (
              <Select
                value={selectedAccount?.id}
                onValueChange={(value) => {
                  const account = accounts.find((a) => a.id === value)
                  setSelectedAccount(account || null)
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sélectionner un compte" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.account_name} ({account.provider})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-sm text-gray-400">Aucun compte configuré</span>
            )}
          </div>

          {/* Add Account Button */}
          <AddAccountDialog />

          {/* Scan Button */}
          {selectedAccount && (
            <ScanDialog
              accountId={selectedAccount.id}
              accountName={selectedAccount.account_name}
            />
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* System Status */}
          <Badge
            variant={systemStatus === 'operational' ? 'success' : 'warning'}
            className="flex items-center space-x-1"
          >
            {systemStatus === 'operational' ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>System Operational</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3" />
                <span>System Degraded</span>
              </>
            )}
          </Badge>

          {/* User Info */}
          {user && (
            <div className="text-sm text-gray-600">
              {user.firstname} {user.lastname}
            </div>
          )}

          {/* Logout Button */}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  )
}
