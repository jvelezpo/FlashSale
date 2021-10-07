import { ConsumeMessage } from 'amqplib'

/** Parse a received message to JSON. */
export function extractMessageContent (msg: ConsumeMessage): any {
  return JSON.parse(msg.content.toString('utf8'))
}

/** Encode a message into a buffer for sending. */
export function encodeMessageContent (item: any): Buffer {
  return Buffer.from(JSON.stringify(item))
}
