import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(): Promise<Response> {
  try {
    const payload = await getPayload({ config: configPromise })
    const draft = await draftMode()
    
    const wasEnabled = draft.isEnabled
    draft.disable()
    
    payload.logger.info('Preview mode exited', {
      wasEnabled,
      timestamp: new Date().toISOString(),
    })
    
    return new Response('Preview mode has been disabled', { 
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      }
    })
  } catch (error) {
    // Fallback in case of any issues
    const draft = await draftMode()
    draft.disable()
    
    return new Response('Preview mode disabled', { status: 200 })
  }
}
