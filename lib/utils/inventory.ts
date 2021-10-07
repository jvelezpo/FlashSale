import { getAllActive } from '../models/flashSaleItems'
import { redis } from './redis'

class Inventory {
  
  checkInventory(): NodeJS.Timer {
    const intervalObj = setInterval(async () => {
      
      const activeFlashSale = await getAllActive()
      activeFlashSale.forEach(item => {
        redis.set(`item:${item.id}`, JSON.stringify(item))
      })
      
    }, 100);

    return intervalObj
  }
}

export default Inventory