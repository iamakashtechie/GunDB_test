import Gun from 'gun'
import 'gun/sea'

let gunInstance = null

/**
 * Create a new Gun instance connected to the user-provided relay URL.
 * Called once when the user submits the connect form.
 */
export function createGunInstance(relayURL) {
  gunInstance = Gun({ peers: [relayURL] })
  return gunInstance
}

/**
 * Get the current Gun instance (must call createGunInstance first).
 */
export function getGunInstance() {
  return gunInstance
}

/**
 * Tear down the current Gun instance.
 * Gun doesn't have a clean destroy API, so we null out the reference
 * and let garbage collection handle the rest.
 */
export function destroyGunInstance() {
  gunInstance = null
}

export { Gun }
