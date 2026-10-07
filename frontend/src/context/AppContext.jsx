import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import { Auth, getAppSetting } from '../services/api'

const AppContext = createContext(null)

const AUTH_KEY = 'auth'

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(AUTH_KEY) === 'true')
  const [shop, setShop] = useState("")
  const [loading, setLoading] = useState(false)



const login = useCallback(async (username, password) => {
  try {
    await Auth(username, password)

    localStorage.setItem(AUTH_KEY, 'true')
    setIsAuthenticated(true)

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}, [])

 useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const settingRes = await getAppSetting()

        const setting = settingRes.data?.data ?? settingRes.data
        setShop(setting.shop_name)
        
      } catch (err) {
        console.log(err)
        console.error("error")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
  }, [])


  const value = {
    isAuthenticated, login, logout,shop,loading
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
