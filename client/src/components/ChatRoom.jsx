import { useEffect, useRef, useState, useCallback } from 'react'
import { getGunInstance } from '../gun'
import { encryptMessage, decryptMessage } from '../crypto'
import Message from './Message'
import StatusBar from './StatusBar'
import './ChatRoom.css'

/**
 * ChatRoom -- real-time encrypted messaging interface.
 *
 * Props:
 *   - roomId:        string (derived hash used as Gun graph key)
 *   - encryptionKey: string (derived AES key for this room)
 *   - displayName:   string (current user's display name)
 *   - relayURL:      string (for display in status bar)
 *   - onDisconnect:  function (return to connect screen)
 */
function ChatRoom({ roomId, encryptionKey, displayName, relayURL, onDisconnect }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesRef = useRef(new Map())
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const didMountRef = useRef(false)

  // Subscribe to room messages
  useEffect(() => {
    const gun = getGunInstance()
    if (!gun) return

    const roomNode = gun.get('room-' + roomId)

    // Add a system message for joining
    const joinId = '_sys_join_' + Date.now()
    messagesRef.current.set(joinId, {
      id: joinId,
      text: `you joined the room`,
      sender: '',
      ts: Date.now(),
      isSystem: true,
    })
    syncMessages()

    // Listen for all messages in the room
    roomNode.map().on(async (data, id) => {
      // Ignore null (deleted nodes) or already-processed messages
      if (!data || !data.enc) return
      if (messagesRef.current.has(id)) return

      try {
        const decrypted = await decryptMessage(data.enc, encryptionKey)
        if (!decrypted) return // wrong key or corrupted

        messagesRef.current.set(id, {
          id,
          text: decrypted.text,
          sender: decrypted.sender,
          ts: decrypted.ts || data.ts,
          isOwn: decrypted.sender === displayName,
          isSystem: false,
        })
        syncMessages()
      } catch {
        // Decryption failed -- skip this message silently
      }
    })

    didMountRef.current = true

    // Focus input on mount
    inputRef.current?.focus()

    return () => {
      // Gun doesn't have a clean .off() for map().on() chains,
      // but destroying the gun instance on disconnect handles cleanup
    }
  }, [roomId, encryptionKey, displayName])

  // Sync messagesRef -> state (sorted by timestamp)
  function syncMessages() {
    const sorted = Array.from(messagesRef.current.values()).sort(
      (a, b) => a.ts - b.ts
    )
    setMessages(sorted)
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send a message
  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || sending) return

    setSending(true)
    try {
      const gun = getGunInstance()
      if (!gun) throw new Error('Not connected')

      const ts = Date.now()
      const encrypted = await encryptMessage(
        { text, sender: displayName, ts },
        encryptionKey
      )

      gun.get('room-' + roomId).set({
        enc: encrypted,
        ts, // unencrypted timestamp for ordering
      })

      setInput('')
    } catch (err) {
      console.error('Send failed:', err)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }, [input, sending, displayName, encryptionKey, roomId])

  // Handle keydown: Enter to send, Shift+Enter for newline (future textarea)
  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chatroom">
      <StatusBar
        relayURL={relayURL}
        roomId={roomId}
        onDisconnect={onDisconnect}
      />

      <div className="chatroom-messages">
        {messages.length === 0 && (
          <p className="chatroom-empty">
            No messages yet. Say something!
          </p>
        )}

        {messages.map((msg) => (
          <Message
            key={msg.id}
            text={msg.text}
            sender={msg.sender}
            ts={msg.ts}
            isOwn={msg.isOwn}
            isSystem={msg.isSystem}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chatroom-input-bar">
        <span className="input-prompt">{displayName}&gt;</span>
        <input
          ref={inputRef}
          type="text"
          className="chatroom-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type a message..."
          disabled={sending}
          maxLength={2000}
          autoComplete="off"
          spellCheck="false"
        />
        <button
          className="chatroom-send"
          onClick={handleSend}
          disabled={sending || !input.trim()}
          title="Send message"
        >
          [send]
        </button>
      </div>
    </div>
  )
}

export default ChatRoom
