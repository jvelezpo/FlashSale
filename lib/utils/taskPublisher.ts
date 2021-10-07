import { connect } from 'amqplib'
import { encodeMessageContent } from './encoding'

export const singleton = <T>(id: string, fn: () => T) => {
  if (process.env.NODE_ENV === 'production') {
    return fn()
  } else {
    if (!global[id]) {
      global[id] = fn()
    }
    return global[id] as T
  }
}

export const taskPublisher = singleton('taskPublisher', async () => {
  const queueConnection = await connect(process.env.RABBIT_URL || 'amqp://localhost')
  const queue = 'task_queue';
  const channel = await queueConnection.createChannel()
  channel.assertQueue(queue, {
    durable: true
  })

  const publish = (payload: any): boolean => {
    return channel.sendToQueue(queue, encodeMessageContent(payload), { persistent: true })
  }

  return { publish }
})
