'use client'

import { useState } from 'react'
import PasswordGate from './PasswordGate'

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  return (
    <>
      <PasswordGate onAuthenticated={() => setIsAuthenticated(true)} />
      {isAuthenticated && children}
    </>
  )
}
