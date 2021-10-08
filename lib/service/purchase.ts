import { getActiveItem, updateFlashItem } from '../models/flashSaleItems'
import { createPurchase } from '../models/purchase'
import { getUserBalance, updateUserBalance } from '../models/users'
import { redis } from '../utils/redis'
import { taskPublisher } from '../utils/taskPublisher'

const internals = {
  currency: 'USD'
}

interface Event {
  userId: string;
  itemId: string;
  quantity: number;
}

class Purchase {

  async purchaseItems(userId: string, itemId: string, quantity: number): Promise<string> {

    const purchasedItem = await redis.get(`purchased:${itemId}:${userId}`)
    if (purchasedItem) {
      return 'You already bought this item, leave others buy as well and enjoy your purchase'
    }

    const purchaseInProgress = await redis.get(`purchase:${itemId}:${userId}`)
    if (purchaseInProgress) {
      return 'Purchase already in progress'
    }

    const maxQuantity = process.env.MAX_ITEMS_ALLOWED_TO_PURCHASE || 1
    if (quantity > maxQuantity) {
      throw new Error('Max allowed quantity error')
    }

    const item = JSON.parse(await redis.get(`item:${itemId}`))
    if (!item) {
      throw new Error('no item found')
    }

    const userUsdBalance = await getUserBalance(String(userId), 'USD')
    if (!userUsdBalance || userUsdBalance.balance < item.price) {
      throw new Error('Not enough balance')
    }

    (await taskPublisher).publish({ userId, itemId, quantity})

    await redis.set(`purchase:${itemId}:${userId}`, JSON.stringify({ time: new Date }))

    return 'Purchase was accepted, we will notify you once the purchase is approved'
  }
  
  async handlePurchaseEvent(event: Event) {
  
    const { quantity, userId, itemId } = event
    console.log('Got Event:', event)
  
    const maxQuantity = process.env.MAX_ITEMS_ALLOWED_TO_PURCHASE || 1
    if (quantity > maxQuantity) {
      return console.log('Max allowed quantity error')
    }
  
    const item = await getActiveItem(itemId)
    if (!item) {
      return console.log('No item found')
    }
    if (item.quantity <= 0) {
      return console.log('We ran out of inventory in this item, please check more products from our amazing store')
    }
  
    const userUsdBalance = await getUserBalance(String(userId), internals.currency)
    if (!userUsdBalance || userUsdBalance.balance < item.price) {
      return console.log('Not enough balance')
    }
  
    try {
      // TODO: investigate why prisma.$transaction throws 'TypeError: promises is not iterable' and add this code in a transaction
      // 1. Decrement balance from the buyer.
      await updateUserBalance(userUsdBalance.id, {
        balance: {
          decrement: item.price,
        },
      })
      // 2. Decrement the item quantity
      const updatedItem = await updateFlashItem(itemId, {
        quantity: {
          decrement: Number(quantity),
        },
      })
      // 3. Create a record of the purchase
      await createPurchase(userId, itemId, item.price, Number(quantity))

      // 4. Clean up 
      //    Remove the item if the quantity reached 0, making this item un available to future purchases
      //    
      if (updatedItem.quantity === 0) {
        await redis.del(`item:${updatedItem.id}`)
      }
      
      await redis.set(`purchased:${itemId}:${userId}`, JSON.stringify({ time: new Date }))
  
    } catch (err) {
      console.log('ERROR:', err)
    }
    
    await redis.del(`purchase:${itemId}:${userId}`)
  }
}

export default Purchase
