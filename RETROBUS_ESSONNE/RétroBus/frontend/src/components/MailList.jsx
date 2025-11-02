import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import './MailList.css'

function MailList({ messages, isLoading, onSelectMessage }) {
  if (isLoading) {
    return (
      <div className="mail-list loading">
        <div className="spinner"></div>
        <p>Chargement des messages...</p>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="mail-list empty">
        <p>Aucun message</p>
      </div>
    )
  }

  return (
    <div className="mail-list">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message-item ${message.read ? '' : 'unread'}`}
          onClick={() => onSelectMessage(message)}
        >
          <div className="message-sender">
            <span className="sender-name">{message.from}</span>
            <span className="sender-time">
              {formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
                locale: fr
              })}
            </span>
          </div>
          <div className="message-subject">
            {message.subject || '(Sans objet)'}
          </div>
          <div className="message-preview">
            {message.body?.substring(0, 80)}...
          </div>
        </div>
      ))}
    </div>
  )
}

export default MailList
