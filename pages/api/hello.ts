// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'

type Data = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await getSession({ req })
  if (!session) {
    return res.status(403).json({
      message:
        'You must be sign in to view the protected content on this page.',
    })
  }

  switch (req.method) {
    case 'GET':
      return res.status(200).json({ message: 'GET' })
    case 'POST':
      return res.status(200).json({ message: 'POST' })
    default:
      return res.status(405).json({ message: 'Method not allowed' })
  }
}
