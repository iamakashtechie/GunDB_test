import { useState, useCallback } from 'react'
import './App.css'
import { createGunInstance, destroyGunInstance } from './gun'
import { initRoom } from './crypto'
import ConnectScreen from './components/ConnectScreen'
import ChatRoom from './components/ChatRoom'

/**
 * App -- root component.
 * Simple state machine: 'connect' screen <-> 'chat' screen.
 * No router needed.
 */
function App() {
  const [screen, setScreen] = useState('connect')
  const [roomState, setRoomState] = useState(null)

  // Called by ConnectScreen on successful form submission
  const handleConnect = useCallback(async ({ relayURL, roomSecret, displayName }) => {
    // 1. Derive room ID + encryption key from secret + relay
    const { roomId, encryptionKey } = await initRoom(relayURL, roomSecret)

    // 2. Create Gun instance connected to the relay
    createGunInstance(relayURL)

    // 3. Store room params and switch to chat screen
    setRoomState({ relayURL, roomId, encryptionKey, displayName })
    setScreen('chat')
  }, [])

  // Called by ChatRoom disconnect button
  const handleDisconnect = useCallback(() => {
    destroyGunInstance()
    setRoomState(null)
    setScreen('connect')
  }, [])

  return (
    <div className="app">
      {screen === 'connect' && (
        <ConnectScreen onConnect={handleConnect} />
      )}

      {screen === 'chat' && roomState && (
        <ChatRoom
          roomId={roomState.roomId}
          encryptionKey={roomState.encryptionKey}
          displayName={roomState.displayName}
          relayURL={roomState.relayURL}
          onDisconnect={handleDisconnect}
        />
      )}
    </div>
  )
}

export default App
