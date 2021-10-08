import { prisma } from '../utils/prisma'
import faker from 'faker'
import { Role } from '.prisma/client'
import { redis } from '../utils/redis'

class FixtureService {

    async up(count = 10, countItems = 10) {

        console.log('Initializing fixtures...');
        const start = new Date();

        const flashItems = []
        for (let i = 0; i < countItems; ++i) {
            let quantity = Math.floor((Math.random() * 500) + 1)
            if (i + 1 === 3 || i + 1 === 4) {
                quantity = 50
            }
            const flashItem = prisma.flashSaleItems.create({
                data: {
                    id: `${i+1}`,
                    name: faker.internet.domainName(),
                    price: Math.floor((Math.random() * 100000) + 100),
                    quantity,
                    beginAt: new Date()
                }
            })
            flashItems.push(flashItem)
        }
        await Promise.all(flashItems)

        const users = []
        const userBalances = []
        for (let i = 0; i < count; ++i) {
            const user = prisma.user.create({
                data: {
                    id: `${ i + 1 }`,
                    name: faker.name.findName(),
                    email: `${ i + 1 }${faker.internet.email()}`,
                    emailVerified: new Date(),
                    image: faker.internet.avatar(),
                    role: Role.USER
                }
            });
            const userBalance = prisma.userBalances.create({
                data: {
                    currency: 'USD',
                    userId: `${ i + 1 }`,
                    balance: Math.floor((Math.random() * 1000000) + 100)  // We init user's balance randomly from 100 to 1000000
                }
            })
            users.push(user)
            userBalances.push(userBalance)
        }
        await Promise.all(users)
        await Promise.all(userBalances)
        await prisma.$disconnect()

        const end = new Date();
        console.log({ elapse: (end.getTime() - start.getTime()) / 1000 }, 'Done!');
    }

    async down() {

        console.log('Removing fixtures...')

        await prisma.purchases.deleteMany({})
        await prisma.userBalances.deleteMany({})
        await prisma.flashSaleItems.deleteMany({})
        await prisma.account.deleteMany({})
        await prisma.session.deleteMany({})
        await prisma.user.deleteMany({})
        await prisma.$disconnect()
        await redis.flushall()
    }
}

export default FixtureService
