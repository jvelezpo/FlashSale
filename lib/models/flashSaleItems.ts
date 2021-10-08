import { prisma } from '../utils/prisma'

export async function getAllActive() {
  return prisma.flashSaleItems.findMany({
    where: {
      quantity: {
        gt: 0
      },
      beginAt: {
        lte: new Date()
      }
    }
  })
}

export async function getActiveItem(id: string) {
  return prisma.flashSaleItems.findFirst({
    where: {
      id: `${id}`,
      quantity: {
        gt: 0
      },
      beginAt: {
        lte: new Date()
      }
    }
  })
}

export async function updateFlashItem(id: string, params: any) {
  return prisma.flashSaleItems.update({
    data: params,
    where: {
      id: `${id}`
    },
  })
}
