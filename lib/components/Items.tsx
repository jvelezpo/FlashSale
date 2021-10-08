import React, { useState } from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react'

export default function Items({ items }) {

  const [message, setMessage] = useState('')
  const [status, setStatus] = useState(0)

  const purchase = async (itemId: string) => {

    setMessage('')
    setStatus(0)
    const response = await fetch(`/api/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId, quantity: 1 })
    })
    const data = await response.json()
    setMessage(data.message)
    setStatus(response.status)
  }

  return (
    <div>
      {message && (
        <>
          <Alert status={status >= 200 && status < 300 ? 'success' : 'error'}>
            <AlertIcon />
            {message}
          </Alert>
        </>
      )}
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>name</Th>
            <Th isNumeric>Price</Th>
            <Th>Begin at</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((item) => (
            <Tr key={item.id}>
              <Td>{item.id}</Td>
              <Td>{item.name}</Td>
              <Td isNumeric>{item.price}</Td>
              <Td>{item.beginAt}</Td>
              <Td>
                <Button colorScheme="messenger" variant="outline" onClick={() => purchase(item.id)}>
                  Purchase
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  )
}
