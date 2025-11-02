import React, { useState, useEffect } from 'react'
import './MailApp.css'
import MailList from './MailList'
import MailViewer from './MailViewer'
import { getMessages } from '../lib/api'

function MailApp({ user }) {
  const [messages, setMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState('inbox') // inbox, sent, archived

  useEffect(() => {
    loadMessages()
  }, [view])

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      const data = await getMessages(view)
      setMessages(data)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mail-app">
      <header className="mail-header">
        <div className="header-brand">
          <h1>RétroBus Mail</h1>
          <p className="user-info">Connecté: {user?.name}</p>
        </div>
        <button 
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem('retromail_token')
            window.location.href = '/'
          }}
        >
          Déconnexion
        </button>
      </header>

      <div className="mail-container">
        {/* Sidebar */}
        <aside className="mail-sidebar">
          <nav className="mail-nav">
            <button 
              className={`nav-item ${view === 'inbox' ? 'active' : ''}`}
              onClick={() => {
                setView('inbox')
                setSelectedMessage(null)
              }}
            >
              📥 Boîte de réception
            </button>
            <button 
              className={`nav-item ${view === 'sent' ? 'active' : ''}`}
              onClick={() => {
                setView('sent')
                setSelectedMessage(null)
              }}
            >
              📤 Messages envoyés
            </button>
            <button 
              className={`nav-item ${view === 'archived' ? 'active' : ''}`}
              onClick={() => {
                setView('archived')
                setSelectedMessage(null)
              }}
            >
              📦 Archivés
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="mail-main">
          {selectedMessage ? (
            <MailViewer 
              message={selectedMessage}
              onBack={() => setSelectedMessage(null)}
            />
          ) : (
            <MailList 
              messages={messages}
              isLoading={isLoading}
              onSelectMessage={setSelectedMessage}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default MailApp
