import { google } from 'googleapis';

export interface GmailEmail {
  id: string;
  subject: string;
  sender: {
    emailAddress: {
      address: string;
      name: string;
    };
  };
  body: {
    content: string;
    contentType: string;
  };
  receivedDateTime: string;
}

export class GmailService {
  private getRedirectUri(): string {
    // For production deployment, use the Render URL
    return 'https://spamsweeper.onrender.com/auth/google/callback';
  }

  private getClient(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      this.getRedirectUri()
    );
    
    oauth2Client.setCredentials({ access_token: accessToken });
    return google.gmail({ version: 'v1', auth: oauth2Client });
  }

  async getUserProfile(accessToken: string) {
    try {
      const gmail = this.getClient(accessToken);
      const response = await gmail.users.getProfile({ userId: 'me' });
      return {
        id: response.data.historyId || '',
        displayName: response.data.emailAddress || '',
        mail: response.data.emailAddress || ''
      };
    } catch (error) {
      console.error('Error getting Gmail profile:', error);
      throw error;
    }
  }

  async getSpamEmails(accessToken: string): Promise<GmailEmail[]> {
    try {
      const gmail = this.getClient(accessToken);
      
      // Get messages from SPAM folder
      const listResponse = await gmail.users.messages.list({
        userId: 'me',
        labelIds: ['SPAM'],
        maxResults: 100
      });

      if (!listResponse.data.messages) {
        return [];
      }

      const emails: GmailEmail[] = [];
      
      // Get full message details for each email
      for (const message of listResponse.data.messages) {
        try {
          const messageResponse = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'full'
          });

          const msg = messageResponse.data;
          const headers = msg.payload?.headers || [];
          
          const subject = headers.find(h => h.name === 'Subject')?.value || '';
          const from = headers.find(h => h.name === 'From')?.value || '';
          const date = headers.find(h => h.name === 'Date')?.value || '';
          
          // Extract sender info
          const senderMatch = from.match(/^(.*?)\s*<([^>]+)>$/) || from.match(/^([^<]+)$/);
          const senderName = senderMatch ? (senderMatch[1] || '').trim() : '';
          const senderEmail = senderMatch && senderMatch[2] ? senderMatch[2].trim() : from;

          // Extract body content
          let bodyContent = '';
          const extractText = (part: any): string => {
            if (part.body?.data) {
              return Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
            if (part.parts) {
              return part.parts.map(extractText).join('\n');
            }
            return '';
          };

          if (msg.payload) {
            bodyContent = extractText(msg.payload);
          }

          emails.push({
            id: msg.id!,
            subject,
            sender: {
              emailAddress: {
                address: senderEmail,
                name: senderName
              }
            },
            body: {
              content: bodyContent,
              contentType: 'text/html'
            },
            receivedDateTime: date
          });
        } catch (error) {
          console.error(`Error fetching message ${message.id}:`, error);
          continue;
        }
      }

      return emails;
    } catch (error) {
      console.error('Error getting Gmail spam emails:', error);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        this.getRedirectUri()
      );

      oauth2Client.setCredentials({ refresh_token: refreshToken });
      
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      return {
        accessToken: credentials.access_token!,
        refreshToken: credentials.refresh_token || refreshToken,
        expiresIn: credentials.expiry_date ? Math.floor((credentials.expiry_date - Date.now()) / 1000) : 3600
      };
    } catch (error) {
      console.error('Error refreshing Gmail access token:', error);
      throw error;
    }
  }

  getAuthUrl(): string {
    const redirectUri = this.getRedirectUri();
    console.log(`🔐 [Gmail Auth] Using redirect URI: ${redirectUri}`);
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      prompt: 'consent'
    });
  }

  async exchangeCodeForTokens(code: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        this.getRedirectUri()
      );

      const { tokens } = await oauth2Client.getToken(code);
      
      return {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        expiresIn: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600
      };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }
}

export const gmailService = new GmailService();