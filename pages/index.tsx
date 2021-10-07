import { signIn, useSession } from 'next-auth/client'
import React from 'react'
import {
  Button,
} from '@chakra-ui/react'

export default function Page() {
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
      Signed in as {session.user?.email} <br /> <br />

      <pre>{document.cookie}</pre>
      next-auth.csrf-token
    </>
  )
}
