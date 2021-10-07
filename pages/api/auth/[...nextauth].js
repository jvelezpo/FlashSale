import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { getUserByEmail, initBalance } from '../../../lib/models/users'
import { redis } from '../../../lib/utils/redis'

const prisma = new PrismaClient()

const options = {
  providers: [
    Providers.Auth0({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      domain: process.env.AUTH0_DOMAIN,
    })
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    signIn(user, account, profile) {
      return true
    },
    async session(session) {
      let user = JSON.parse(await redis.get(`user:${session.user.email}`))
      if (!user) {
        user = await getUserByEmail(session.user.email)
        await initBalance(user.id, 'USD')
        await redis.set(`user:${session.user.email}`, JSON.stringify(user)) 
      }
      session.user.id = user.id
      session.user.role = user.role
      return session
    },
  }
}

const nextAuth = (req, res) => NextAuth(req, res, options)

export default nextAuth
