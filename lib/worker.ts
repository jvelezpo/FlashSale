import Purchase from './service/purchase'
import Inventory from './utils/inventory'
import { taskSubscriber } from './utils/taskSubscriber'

const purchase = new Purchase()

const startServer = async () => {
  (await taskSubscriber('task_queue')).consume(purchase.handlePurchaseEvent)
  const inventory = new Inventory()

  const inventoryChecker = inventory.checkInventory()

  process.on('beforeExit', () => {
    clearInterval(inventoryChecker);
 });
}

startServer();
