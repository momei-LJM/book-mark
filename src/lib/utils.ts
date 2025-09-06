import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const Logger = {
  info: (...messages: any[]) => {
    console.info(`[INFO]`, ...messages)
  },
  log: (...messages: any[]) => {
    console.log(`[LOG]`, ...messages)
  },
  error: (...messages: any[]) => {
    console.error(`[ERROR]`, ...messages)
  },
  warn: (...messages: any[]) => {
    console.warn(`[WARN]`, ...messages)
  },
}
