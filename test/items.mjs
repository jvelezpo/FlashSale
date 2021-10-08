/* eslint-env node, mocha */
import chai from 'chai'
import Redis from 'ioredis'
import util from 'util'
import pkg from '@prisma/client';

const { PrismaClient } = pkg;

chai.should();
const expect = chai.expect;
const sleep = util.promisify(setTimeout);

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379')
const prisma = new PrismaClient()

describe('Items', () => {
  before(async () => {
  })
  
  after(async () => {
    await redis.flushall()
    await prisma.flashSaleItems.deleteMany({})
    await prisma.$disconnect()
  })

  it('should store an item in Redis after it is created in DB', async () => {
    const itemId = 'id'
    const item = await prisma.flashSaleItems.create({
      data: {
        id: itemId,
        name: 'name 1',
        quantity: 10,
        beginAt: new Date(),
        price: 500
      }
    })

    await sleep(200)  // Wait fot the worker to refresh the available inventory in Redis

    const redisItem = JSON.parse(await redis.get(`item:${itemId}`))

    expect(redisItem.id).to.eq(item.id)
    expect(redisItem.name).to.eq(item.name)
    expect(redisItem.quantity).to.eq(item.quantity)
    expect(redisItem.price).to.eq(item.price)
  })
})