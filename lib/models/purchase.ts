import { prisma } from '../utils/prisma'

export async function createPurchase(userId: string, itemId: string, price: number, quantity: number) {
  return prisma.purchases.create({
    data: {
      userId: `${userId}`,
      itemId: `${itemId}`,
      price,
      quantity
    }
  })
}
