import { createFileRoute } from '@tanstack/react-router'
import { HttpError, handleApi } from '../server/http.server'
import { scanStream } from '../server/scan-stream.server'
import { publicScreen } from '../server/screens.server'

export const Route = createFileRoute('/api/events/$screenId')({
  server: { handlers: {
    GET: ({ request, params }) => handleApi(async () => {
      const lastId = request.headers.get('Last-Event-ID')
      if (lastId && !/^\d{1,20}-\d{1,20}$/.test(lastId)) throw new HttpError(400, 'Invalid event ID')
      const screen = await publicScreen(params.screenId)
      return scanStream(screen, lastId, request.signal)
    }),
  } },
})
