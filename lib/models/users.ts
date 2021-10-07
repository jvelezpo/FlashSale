import { prisma } from '../utils/prisma'

export async function getUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email }
  })
}

export async function getUserBalance(userId: string, currency: string) {
  return prisma.userBalances.findFirst({
    where: { userId, currency }
  })
}

export async function initBalance(userId: string, currency: string) {
  console.log('userid', userId)
  const balance = await prisma.userBalances.findFirst({
    where: { userId, currency }
  })
  if (!balance) {
    return prisma.userBalances.create({
      data: {
        userId,
        currency,
        balance: Math.floor((Math.random() * 1000000) + 100)  // We init user's balance randomly from 100 to 1000000
      }
    })
  }
  return balance
}

export async function updateUserBalance(id: string, params: any) {
  return prisma.userBalances.update({
    data: params,
    where: {
      id
    },
  })
}