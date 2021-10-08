import type { NextApiRequest, NextApiResponse } from 'next'
import Purchase from '../../lib/service/purchase'
import initMiddleware from '../../lib/utils/initMiddleware'
import validateMiddleware from '../../lib/utils/validateMiddleware'
import { check, validationResult } from 'express-validator'

type Data = {
  message: string
}

const internals = {
  purchase: new Purchase()
}

const validateBody = initMiddleware(
  validateMiddleware([
      check('userId').isLength({ min: 1, max: undefined }),
      check('itemId').isLength({ min: 1, max: undefined }),
      check('quantity').isInt({ min: 1, max: 50}),
  ], validationResult)
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const purchase = async () => {

    try {
      const result = await internals.purchase.purchaseItems(req.body.userId, req.body.itemId, req.body.quantity)
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
