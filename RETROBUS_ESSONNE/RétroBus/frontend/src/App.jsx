import React, { useState, useEffect } from 'react'
import './App.css'
import SplashScreen from './components/SplashScreen'
import MailApp from './components/MailApp'
import { validateToken } from './lib/auth'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    // Vérifier le token au démarrage
    const checkAuth = async () => {
      try {
        const token = new URLSearchParams(window.location.search).get('token')
        
        if (!token) {
          setIsLoading(false)
          return
        }

        // Valider le token avec le backend
        const response = await validateToken(token)
        if (response.success) {
          localStorage.setItem('retromail_token', token)
          localStorage.setItem('retromail_user', JSON.stringify(response.user))
          setUser(response.user)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Afficher le splash 3 secondes minimum
    const splashTimer = setTimeout(() => {
      setShowSplash(false)
      checkAuth()
    }, 3000)

    return () => clearTimeout(splashTimer)
  }, [])

  if (isLoading || showSplash) {
    return <SplashScreen />
  }

  if (!isAuthenticated) {
    return (
      <div className="access-denied">
        <h1>Accès refusé</h1>
        <p>Vous n'êtes pas autorisé à accéder à RétroBus Mail.</p>
        <p className="info">Cet accès est réservé aux utilisateurs MyRBE.</p>
      </div>
    )
  }

  return <MailApp user={user} />
}

export default App
