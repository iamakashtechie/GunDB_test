/**
 * Message.jsx -- renders a single chat message in terminal style.
 *
 * Format:  [14:32] alice: hey, you there?
 *
 * Props:
 *   - text:     string (message content)
 *   - sender:   string (display name)
 *   - ts:       number (timestamp ms)
 *   - isOwn:    boolean (true if sent by current user)
 *   - isSystem: boolean (true for system messages like join/leave)
 */

function Message({ text, sender, ts, isOwn, isSystem }) {
  const time = formatTime(ts)

  if (isSystem) {
    return (
      <div className="msg msg--system">
        <span className="msg-time">[{time}]</span>{' '}
        <span className="msg-text">{text}</span>
      </div>
    )
  }

  return (
    <div className={`msg ${isOwn ? 'msg--own' : ''}`}>
      <span className="msg-time">[{time}]</span>{' '}
      <span className="msg-sender">{sender}:</span>{' '}
      <span className="msg-text">{text}</span>
    </div>
  )
}

/**
 * Format a timestamp for display.
 * Today: HH:MM
 * Older: MM/DD HH:MM
 */
function formatTime(ts) {
  if (!ts) return '--:--'
  const d = new Date(ts)
  const now = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')

  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()

  if (isToday) return `${hh}:${mm}`

  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${mo}/${dd} ${hh}:${mm}`
}

export default Message
