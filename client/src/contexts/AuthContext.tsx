import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  const login = (newToken: string) => {
    setToken(newToken)
    localStorage.setItem('auth_token', newToken)
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('auth_token')
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!token,
      login,
      logout,
      token
    }}>
      {children}
    </AuthContext.Provider>
  )
}