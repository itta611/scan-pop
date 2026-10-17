import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { publicScreen } from './screens.server'

export const getScreen = createServerFn({ method: 'GET' })
  .validator(z.uuid())
  .handler(({ data }) => publicScreen(data))
