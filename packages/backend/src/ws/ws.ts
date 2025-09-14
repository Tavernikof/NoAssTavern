import type { FastifyInstance } from 'fastify'

export async function registerWs(app: FastifyInstance) {
  app.get('/api/ws', { websocket: true }, (connection, req) => {
    connection.socket.send(JSON.stringify({ type: 'hello', ts: Date.now() }))

    connection.socket.on('message', (raw: Buffer) => {
      try {
        const msg = JSON.parse(String(raw))
        connection.socket.send(
          JSON.stringify({ type: 'echo', ts: Date.now(), received: msg })
        )
      } catch {
        connection.socket.send(JSON.stringify({ type: 'echo', ts: Date.now(), received: String(raw) }))
      }
    })

    connection.socket.on('close', () => {
      // no-op
    })
  })
}

