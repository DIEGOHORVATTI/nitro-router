// Re-export all types and functions from src
export * from './src'

// Explicitly export NitroRouter class
export { NitroRouter } from './src/nitro-router'

// Default export
import { NitroRouter } from './src/nitro-router'
export default NitroRouter
