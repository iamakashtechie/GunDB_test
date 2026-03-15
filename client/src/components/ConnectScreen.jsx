import { useState } from 'react'
import './ConnectScreen.css'

function ConnectScreen({ onConnect }) {
  const [relayURL, setRelayURL] = useState(
    () => localStorage.getItem('gunchat-relay') || ''
  )
  const [roomSecret, setRoomSecret] = useState('')
  const [displayName, setDisplayName] = useState(
    () => localStorage.getItem('gunchat-name') || ''
  )
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const url = relayURL.trim()
    const secret = roomSecret.trim()
    const name = displayName.trim()

    if (!url || !secret || !name) {
      setError('All fields are required.')
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      setError('Invalid relay URL. Include the protocol (http:// or https://).')
      return
    }

    setConnecting(true)

    // Persist convenience fields
    localStorage.setItem('gunchat-relay', url)
    localStorage.setItem('gunchat-name', name)

    try {
      await onConnect({ relayURL: url, roomSecret: secret, displayName: name })
    } catch (err) {
      setError(err.message || 'Connection failed.')
      setConnecting(false)
    }
  }

  return (
    <div className="connect-screen">
      <div className="connect-card">
        <h1 className="connect-title">
          <span className="title-prefix">&gt;</span> GunChat
        </h1>
        <p className="connect-subtitle">
          Decentralized. Encrypted. Yours.
        </p>

        <form onSubmit={handleSubmit} className="connect-form">
          <label className="field">
            <span className="field-label">relay_url</span>
            <input
              type="text"
              value={relayURL}
              onChange={(e) => setRelayURL(e.target.value)}
              placeholder="https://your-relay.ngrok.io/gun"
              autoComplete="url"
              spellCheck="false"
              disabled={connecting}
            />
          </label>

          <label className="field">
            <span className="field-label">room_secret</span>
            <input
              type="password"
              value={roomSecret}
              onChange={(e) => setRoomSecret(e.target.value)}
              placeholder="shared passphrase"
              autoComplete="off"
              disabled={connecting}
            />
          </label>

          <label className="field">
            <span className="field-label">display_name</span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="your name"
              autoComplete="username"
              maxLength={24}
              disabled={connecting}
            />
          </label>

          {error && <p className="connect-error">{error}</p>}

          <button
            type="submit"
            className="connect-btn"
            disabled={connecting}
          >
            {connecting ? '[ connecting... ]' : '[ connect ]'}
          </button>
        </form>

        <p className="connect-footer">
          E2E encrypted &middot; No accounts &middot; Self-hosted relay
        </p>
      </div>
    </div>
  )
}

export default ConnectScreen
