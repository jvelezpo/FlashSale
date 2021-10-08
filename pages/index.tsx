import { getSession, signIn, useSession } from 'next-auth/client'
import React from 'react'
import Items from '../lib/components/Items'
import History from '../lib/components/History'
import {
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { prisma } = require('../lib/utils/prisma')
  const session = await getSession(context)

  if (!session) {
    return { props: {} }
  }

  const itemsPromise = prisma.flashSaleItems.findMany({
    where: {
      quantity: {
        gt: 0
      },
      beginAt: {
        lte: new Date()
      }
    }
  })

  const purchasesPromise = prisma.purchases.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      item: true,
    }
  })

  const usdBalancePromise = prisma.userBalances.findFirst({
    where: { userId: session.user.id, currency: 'USD' }
  })

  const [items, purchases, usdBalance] = await Promise.all([itemsPromise, purchasesPromise, usdBalancePromise])

  return { props: { items: JSON.stringify(items), purchases: JSON.stringify(purchases), usdBalance: JSON.stringify(usdBalance) } }
}

export default function Page({ items, purchases, usdBalance }) {
  const [session] = useSession()


  if (!session) {
    return (
      <>
        Not signed in <br />
        <Button onClick={() => signIn('auth0')}>Sign in</Button>
      </>
    )
  }

  return (
    <>
      {usdBalance && 
        <>
          <div>USD Balance: {JSON.parse(usdBalance).balance} </div><br />
        </>
      }
      <Tabs isFitted variant="enclosed">
        <TabList mb="1em">
          <Tab>Items</Tab>
          <Tab>History</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Items items={JSON.parse(items)} />
          </TabPanel>
          <TabPanel>
            <History items={JSON.parse(purchases)} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  )
}
