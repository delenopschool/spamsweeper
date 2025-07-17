import { Client } from '@microsoft/microsoft-graph-client';

export interface GraphEmail {
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

export class MicrosoftGraphService {
  private getClient(accessToken: string): Client {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
  }

  async getUserProfile(accessToken: string) {
    const client = this.getClient(accessToken);
    return await client.api('/me').get();
  }

  async getSpamEmails(accessToken: string, folders?: string[]): Promise<GraphEmail[]> {
    const client = this.getClient(accessToken);
    
    try {
      // Default to JunkEmail folder if no folders specified
      const targetFolders = folders && folders.length > 0 ? folders : ['JunkEmail'];
      
      console.log(`📫 [Graph] Starting to fetch emails from folders: ${targetFolders.join(', ')}`);
      const startTime = Date.now();
      
      // For multiple folders, we need to fetch from each folder separately
      const allEmails: GraphEmail[] = [];
      
      for (const folder of targetFolders) {
        try {
          const response = await client
            .api(`/me/mailFolders/${folder}/messages`)
            .select('id,subject,sender,body,receivedDateTime')
            .top(1000)
            .get();

          if (response.value && Array.isArray(response.value)) {
            allEmails.push(...response.value);
            console.log(`📫 [Graph] Fetched ${response.value.length} emails from folder ${folder}`);
          }
        } catch (error) {
          console.error(`❌ [Graph] Error fetching emails from folder ${folder}:`, error);
          // Continue with other folders even if one fails
        }
      }

      const fetchTime = Date.now() - startTime;
      console.log(`📫 [Graph] Total: ${allEmails.length} emails from Microsoft Graph in ${fetchTime}ms`);

      return allEmails;
    } catch (error) {
      console.error('❌ [Graph] Error fetching spam emails:', error);
      throw new Error('Failed to fetch spam emails from Outlook');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('Microsoft OAuth credentials not configured');
    }

    const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/User.Read'
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
    };
  }

  private getRedirectUri(): string {
    // Always use the production URL for OAuth redirects to avoid dynamic URI issues
    return 'https://spamsweeper.onrender.com/auth/microsoft/callback';
  }

  getAuthUrl(): string {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const redirectUri = this.getRedirectUri();
    
    console.log(`🔐 [Auth] Using redirect URI: ${redirectUri}`);
    
    if (!clientId) {
      throw new Error('Microsoft Client ID not configured');
    }

    const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/User.Read');
    authUrl.searchParams.append('response_mode', 'query');
    authUrl.searchParams.append('prompt', 'select_account');

    return authUrl.toString();
  }

  async exchangeCodeForTokens(code: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const redirectUri = this.getRedirectUri();
    
    console.log(`🔐 [Auth] Exchanging code with redirect URI: ${redirectUri}`);
    
    if (!clientId || !clientSecret) {
      throw new Error('Microsoft OAuth credentials not configured');
    }

    const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Auth] Token exchange failed:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        redirectUri,
        clientId: clientId?.substring(0, 8) + '...'
      });
      throw new Error(`Failed to exchange code for tokens: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }
}

export const microsoftGraphService = new MicrosoftGraphService();
