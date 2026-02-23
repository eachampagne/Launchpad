import { google } from 'googleapis';

import { prisma } from '../database/prisma.js';

async function cleanTokens(userId: number) {
  try {
    const now = new Date();

    prisma.googleToken.deleteMany({
      where: {
        accountId: userId,
        OR: [
          {
            refresh_token: null,
            expiry_date: {
              lte: now
            }
          },
          {
            NOT: {
              refresh_token: null
            },
            refresh_expiry_date: {
              lte: now
            }
          }
        ]
      }
    })

  } catch (error) {
    console.error('Failed to clean up tokens:', error);
  }
}

export async function getGoogleOauth(userId: number, widget: string) {
  let authType: 'authCalendar' | 'authGmail' | 'authProfile';

  switch (widget) {
    case 'calendar':
      authType = 'authCalendar';
      break;
    case 'gmail':
      authType = 'authGmail';
      break;
    case 'profile':
      authType = 'authProfile';
      break;
    default: // not a valid widget type
      return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env['GOOGLE_CLIENT_ID'],
    process.env['GOOGLE_CLIENT_SECRET'],
    process.env['GOOGLE_AUTH_REDIRECT_URL']
  );

  // remove any expired tokens
  await cleanTokens(userId);

  // this token isn't expired because it wasn't removed by cleanTokens
  // however, if the permissions have been manually revoked in the Google account settings,
  // it may still be invalid
  const token = await prisma.googleToken.findFirst({
    where: {
      accountId: userId,
      [authType]: true
    }
  });

  if (!token) {return null};

  oauth2Client.setCredentials({
    access_token: token.access_token,
    id_token: token.id_token
  });

  if (token.refresh_token) {
    oauth2Client.setCredentials({
      refresh_token: token.refresh_token
    });
  }

  return oauth2Client;
}

