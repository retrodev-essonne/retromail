import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import './MailViewer.css'

function MailViewer({ message, onBack }) {
  return (
    <div className="mail-viewer">
      <header className="viewer-header">
        <button className="back-btn" onClick={onBack}>
          ← Retour
        </button>
        <h2>{message.subject || '(Sans objet)'}</h2>
      </header>

      <div className="viewer-meta">
        <div className="meta-row">
          <span className="label">De:</span>
          <span className="value">{message.from}</span>
        </div>
        <div className="meta-row">
          <span className="label">À:</span>
          <span className="value">{message.to}</span>
        </div>
        <div className="meta-row">
          <span className="label">Date:</span>
          <span className="value">
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
              locale: fr
            })}
          </span>
        </div>
      </div>

      <div className="viewer-body">
        {message.body}
      </div>
    </div>
  )
}

export default MailViewer
