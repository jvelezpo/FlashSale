import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'
import Purchase from '../../lib/service/purchase'
import initMiddleware from '../../lib/utils/init-middleware'
import validateMiddleware from '../../lib/utils/validate-middleware'
import { check, validationResult } from 'express-validator'

type Data = {
  message: string
}

const internals = {
  purchase: new Purchase()
}

const validateBody = initMiddleware(
  validateMiddleware([
      check('itemId').isLength({ min: 1, max: undefined }),
      check('quantity').isInt({ min: 1, max: 50}),
  ], validationResult)
)

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

  const purchase = async () => {

    try {
      const result = await internals.purchase.purchaseItems(session.user.id, req.body.itemId, req.body.quantity)
      return res.status(202).json({ message: result })
    } catch (err) {
      return res.status(400).json({ message: err.message })
    }
  }

  switch (req.method) {
    case 'POST':
      await validateBody(req, res)
      return purchase()
    default:
      return res.status(405).json({ message: 'Method not allowed' })
  }
}
