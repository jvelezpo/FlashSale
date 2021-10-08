import React from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react'

export default function History({ items }) {
  return (
    <div>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>name</Th>
            <Th isNumeric>Price Paid</Th>
            <Th isNumeric>Quantity</Th>
            <Th>Date</Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((item) => (
            <Tr key={item.id}>
              <Td>{item.id}</Td>
              <Td>{item.item.name}</Td>
              <Td isNumeric>{item.price}</Td>
              <Td isNumeric>{item.quantity}</Td>
              <Td>
                {`${new Date(item.createdAt).toDateString()} ${new Date(item.createdAt).toLocaleTimeString()}`}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  )
}
