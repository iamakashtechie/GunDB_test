import Gun from 'gun'
import 'gun/sea'

const SEA = Gun.SEA

/**
 * Derive a deterministic salt from the relay URL.
 * This ensures the same relay + same secret = same encryption key,
 * but different relays with the same secret = different keys.
 */
export async function deriveRoomSalt(relayURL) {
  const salt = await SEA.work(relayURL, 'gun-chat-salt')
  if (!salt) throw new Error('Failed to derive room salt')
  return salt
}

/**
 * Derive the encryption key from the room secret + salt (PBKDF2).
 * All users with the same secret + relay URL will derive the same key.
 */
export async function deriveEncryptionKey(roomSecret, salt) {
  const key = await SEA.work(roomSecret, salt)
  if (!key) throw new Error('Failed to derive encryption key')
  return key
}

/**
 * Derive a deterministic room ID from the room secret.
 * This is used as the Gun graph key -- the relay sees this hash
 * but cannot reverse it to recover the passphrase.
 */
export async function deriveRoomId(roomSecret) {
  const id = await SEA.work(roomSecret, 'room-id-salt')
  if (!id) throw new Error('Failed to derive room ID')
  return id
}

/**
 * Encrypt a message object before writing to Gun.
 * The entire payload (text, sender, timestamp) is encrypted.
 */
export async function encryptMessage({ text, sender, ts }, key) {
  const encrypted = await SEA.encrypt({ text, sender, ts }, key)
  if (!encrypted) throw new Error('Failed to encrypt message')
  return encrypted
}

/**
 * Decrypt an encrypted message blob back to { text, sender, ts }.
 * Returns null if decryption fails (wrong key, corrupted data, etc).
 */
export async function decryptMessage(encBlob, key) {
  const decrypted = await SEA.decrypt(encBlob, key)
  return decrypted || null
}

/**
 * Convenience: derive all room params at once from relay URL + secret.
 * Returns { roomId, encryptionKey } ready for use.
 */
export async function initRoom(relayURL, roomSecret) {
  const [salt, roomId] = await Promise.all([
    deriveRoomSalt(relayURL),
    deriveRoomId(roomSecret),
  ])
  const encryptionKey = await deriveEncryptionKey(roomSecret, salt)
  return { roomId, encryptionKey }
}
