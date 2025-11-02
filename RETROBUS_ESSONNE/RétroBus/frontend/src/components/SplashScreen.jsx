import React from 'react'
import './SplashScreen.css'

function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        {/* Remplacer le chemin par ton GIF */}
        <img 
          src="/splash.gif" 
          alt="RétroBus" 
          className="splash-image"
        />
        
        <div className="splash-loader">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen
