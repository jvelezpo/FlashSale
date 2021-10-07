import { prisma } from '../utils/prisma'
import faker from 'faker'
import { Role } from '.prisma/client'
import { redis } from '../utils/redis'

class FixtureService {

    async up(count = 10) {

        console.log('Initializing fixtures...');
        const start = new Date();

        const flashItems = []
        for (let i = 0; i < count - 1; ++i) {
            const flashItem = await prisma.flashSaleItems.create({
                data: {
                    name: faker.internet.domainName(),
                    price: Math.floor((Math.random() * 100000) + 100),
                    quantity: Math.floor((Math.random() * 100) + 1),
                    beginAt: new Date()
                }
            })
            flashItems.push(flashItem)
        }

        for (let i = 0; i < count - 1; ++i) {
            const user = await prisma.user.create({
                data: {
                    name: faker.name.findName(),
                    email: faker.internet.email(),
                    emailVerified: new Date(),
                    image: faker.internet.avatar(),
                    role: Role.USER
                }
            });
            await prisma.userBalances.create({
                data: {
                    currency: 'USD',
                    userId: user.id,
                    balance: Math.floor((Math.random() * 1000000) + 100)  // We init user's balance randomly from 100 to 1000000
                }
            })
        }

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
