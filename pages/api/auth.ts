import type { NextApiRequest, NextApiResponse } from 'next'
import process from 'node:process'

interface AuthRequestBody {
  inviteCode?: string
}

interface AuthResponse {
  authorized: boolean
}

function handler(req: NextApiRequest, res: NextApiResponse<AuthResponse>) {
  const body = req.body as AuthRequestBody
  if (body.inviteCode !== process.env.INVITE_CODE) {
    return res.status(401).json({ authorized: false })
  }

  return res.status(200).json({ authorized: true })
}

export default handler
