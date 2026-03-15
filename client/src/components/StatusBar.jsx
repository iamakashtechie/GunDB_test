import { useEffect, useState } from 'react'
import { getGunInstance } from '../gun'

/**
 * StatusBar -- displays connection status, relay URL, and disconnect button.
 *
 * Props:
 *   - relayURL:     string (the relay server URL)
 *   - roomId:       string (hashed room ID, first 8 chars shown)
 *   - onDisconnect: function (return to connect screen)
 */
function StatusBar({ relayURL, roomId, onDisconnect }) {
  // Derive initial status synchronously (no Gun = disconnected)
  const gun = getGunInstance()
  const initialStatus = gun ? 'reconnecting' : 'disconnected'

  // 'connected' | 'disconnected' | 'reconnecting'
  const [status, setStatus] = useState(initialStatus)

  useEffect(() => {
    if (!gun) return

    // Gun fires 'hi' when a peer connects and 'bye' when it disconnects.
    function onHi() {
      setStatus('connected')
    }

    function onBye() {
      setStatus('reconnecting')
    }

    gun.on('hi', onHi)
    gun.on('bye', onBye)

    // Gun may already be connected -- check after a short delay
    const timer = setTimeout(() => {
      const peers = gun._.opt.peers
      const hasConnected = Object.values(peers || {}).some(
        (p) => p.wire && p.wire.readyState === 1
      )
      if (hasConnected) setStatus('connected')
    }, 1500)

    return () => {
      clearTimeout(timer)
    }
  }, [gun])

  const statusDot =
    status === 'connected'
      ? 'status-dot--connected'
      : status === 'reconnecting'
        ? 'status-dot--reconnecting'
        : 'status-dot--disconnected'

  // Truncate relay URL for display
  const displayURL = truncateURL(relayURL)
  const roomShort = roomId ? roomId.slice(0, 8) + '...' : ''

  return (
    <div className="status-bar">
      <div className="status-left">
        <span className={`status-dot ${statusDot}`} />
        <span className="status-url" title={relayURL}>
          {displayURL}
        </span>
        <span className="status-room" title={roomId}>
          #{roomShort}
        </span>
      </div>

      <button className="status-disconnect" onClick={onDisconnect}>
        [disconnect]
      </button>
    </div>
  )
}

function truncateURL(url) {
  try {
    const u = new URL(url)
    const host = u.hostname
    // Show just the hostname, truncated if too long
    return host.length > 28 ? host.slice(0, 25) + '...' : host
  } catch {
    return url.length > 28 ? url.slice(0, 25) + '...' : url
  }
}

export default StatusBar
