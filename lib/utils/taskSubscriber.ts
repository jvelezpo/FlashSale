
import { connect, ConsumeMessage } from 'amqplib'
import { extractMessageContent } from './encoding'

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

export const taskSubscriber = (queue: string) => singleton('taskSubscriber', async () => {
  const queueConnection = await connect(process.env.RABBIT_URL || 'amqp://localhost')
  const channel = await queueConnection.createChannel()
  channel.prefetch(1)
  channel.assertQueue(queue, {
    durable: true
  })

  const consume = (handleMessage: any): any => {
    // return channel.consume(queue, encodeMessageContent(payload), { persistent: true })
    channel.consume(queue,
      async (msg): Promise<void> => {
        try {
          const messageContent = extractMessageContent(msg as ConsumeMessage)
          await handleMessage(messageContent)
          channel.ack(msg as any)
        } catch (err) {
          console.log('ERROR', err)
          channel.nack(msg as any, false, false)
        }
      }, {
        noAck: false
      })
  }

  return { consume }
})
