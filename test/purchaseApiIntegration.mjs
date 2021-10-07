/* eslint-env node, mocha */
import chai from 'chai'
import chaiHttp from 'chai-http'
import Redis from 'ioredis'
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

chai.use(chaiHttp);

chai.should();
const expect = chai.expect;

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379')
const prisma = new PrismaClient()

const internals = {
  users: [{
      id: '1',
      name: 'name 1',
      email: 'em@mail.com'
  }, {
    id: '2',
    name: 'name 2',
    email: 'em2@mail.com'
  }],
  items: [{
    id: '1',
    name: 'name 1',
    quantity: 10,
    beginAt: new Date(),
    price: 500
  }, {
    id: '2',
    name: 'name 2',
    quantity: 20,
    beginAt: new Date(),
    price: 4000
  }],
  balances: [{
    userId: '1',
    currency: 'USD',
    balance: 1000
  }]
}

describe('Purchase items', () => {
  before(async () => {
    await Promise.all(internals.users.map(user => prisma.user.create({ data: user })))
    await Promise.all(internals.items.map(item => prisma.flashSaleItems.create({ data: item })))
    await Promise.all(internals.balances.map(balance => prisma.userBalances.create({ data: balance })))
  })

  after(async () => {
    await prisma.flashSaleItems.deleteMany({})
    await prisma.userBalances.deleteMany({})
    await prisma.user.deleteMany({})
  })

  describe('edge cases', () => {

    it('Purchase already in progress', (done) => {
      redis.set(`purchase:${internals.users[0].id}:${internals.items[0].id}`, JSON.stringify({ time: new Date }))
      chai
        .request('http://localhost:3000')
        .post('/api/noAuthPurchase')
        .send({ userId: internals.users[0].id, itemId: internals.items[0].id, quantity: 1 })
        .end(async (err, res) => {

          res.body.message.should.eq('Purchase already in progress')
          res.should.have.status(202);
          await redis.del(`purchase:${internals.users[0].id}:${internals.items[0].id}`)
          done()
        })
    })

    it('Item not found', (done) => {
      chai
        .request('http://localhost:3000')
        .post('/api/noAuthPurchase')
        .send({ userId: '1', itemId: '1', quantity: 1 })
        .end((err, res) => {

          res.body.message.should.eq('no item found')
          res.should.have.status(400);
          done()
        })
    })
    
    it('Not enough balance', (done) => {
      redis.set(`item:${internals.items[1].id}`, JSON.stringify(internals.items[1]))
      chai
        .request('http://localhost:3000')
        .post('/api/noAuthPurchase')
        .send({ userId: internals.users[0].id, itemId: internals.items[1].id, quantity: 1 })
        .end((err, res) => {

          res.body.message.should.eq('Not enough balance')
          res.should.have.status(400);
          redis.del(`item:${internals.items[1].id}`)
          done()
        })
    })

    it('Max allowed quantity error', (done) => {
      chai
        .request('http://localhost:3000')
        .post('/api/noAuthPurchase')
        .send({ userId: internals.users[0].id, itemId: internals.items[1].id, quantity: 2 })
        .end((err, res) => {

          res.body.message.should.eq('Max allowed quantity error')
          res.should.have.status(400);
          done()
        })
    })
  })
  
  it('should submit a purchase to be executed ', (done) => {
    redis.set(`item:${internals.items[0].id}`, JSON.stringify(internals.items[0]))
    chai
      .request('http://localhost:3000')
      .post('/api/noAuthPurchase')
      .send({ userId: internals.users[0].id, itemId: internals.items[0].id, quantity: 1 })
      .end((err, res) => {
        res.body.message.should.eq('Purchase in accepted, we will notify you once the purchase is approved')
        res.should.have.status(202);
        redis.del(`item:${internals.items[0].id}`)
        done();
      });
  });
});
