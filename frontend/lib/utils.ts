import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatErrorMessage(error: any): string {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail)) {
    return detail.map((e: any) => {
      if (typeof e === 'string') return e
      if (e.msg) return `${e.loc ? e.loc.join('.') + ': ' : ''}${e.msg}`
      return JSON.stringify(e)
    }).join(', ')
  }

  if (typeof detail === 'object' && detail !== null) {
    return JSON.stringify(detail)
  }

  return error?.message || 'Une erreur est survenue'
}
