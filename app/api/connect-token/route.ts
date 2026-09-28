import { PluggyClient } from 'pluggy-sdk';

export async function POST(req: Request) {
  const pluggy = new PluggyClient({
    clientId: process.env.PLUGGY_CLIENT_ID!,
    clientSecret: process.env.PLUGGY_CLIENT_SECRET!,
  });

  const { clientUserId } = await req.json();

  const connectToken = await pluggy.createConnectToken(undefined, {
    clientUserId, // Optional: track your users
  });

  return Response.json({ accessToken: connectToken.accessToken });
}
