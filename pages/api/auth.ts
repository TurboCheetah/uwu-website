import type { NextApiRequest, NextApiResponse } from "next";

type AuthResponse = {
  authorized: boolean;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthResponse>
) {
  if (req.body.inviteCode !== "iUmdLHTDfugFbfpTl8TjEOjnAu14XfC0") {
    return res.status(401).json({ authorized: false });
  }

  return res.status(200).json({ authorized: true });
}
