import { create } from 'zustand'
import type { User, CloudAccount } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('access_token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('access_token') : false,
  setAuth: (token, user) => {
    localStorage.setItem('access_token', token)
    set({ token, user, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('access_token')
    set({ token: null, user: null, isAuthenticated: false })
  },
  setUser: (user) => set({ user }),
}))

interface AccountState {
  accounts: CloudAccount[]
  selectedAccount: CloudAccount | null
  setAccounts: (accounts: CloudAccount[]) => void
  setSelectedAccount: (account: CloudAccount | null) => void
  addAccount: (account: CloudAccount) => void
  removeAccount: (accountId: string) => void
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  selectedAccount: null,
  setAccounts: (accounts) => set({ accounts }),
  setSelectedAccount: (account) => set({ selectedAccount: account }),
  addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
  removeAccount: (accountId) =>
    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== accountId),
      selectedAccount: state.selectedAccount?.id === accountId ? null : state.selectedAccount,
    })),
}))
