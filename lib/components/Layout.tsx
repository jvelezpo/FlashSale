import { useSession } from 'next-auth/client'
import { Spinner, Flex } from "@chakra-ui/react"

export default function Layout({ children }) {
  const [session, loading] = useSession()

  if (loading) {
    return (
      <Flex h="100vh" justify="center" align="center">
        <Spinner colorScheme="whatsapp" size="xl" />
      </Flex>
    )
  }

  return (
    <>
    {children}
    </>
  )
}
