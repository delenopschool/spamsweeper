import axios from 'axios';

export interface YahooTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  scope: string;
}

export interface YahooUserProfile {
  id: string;
  mail: string;
  displayName: string;
  givenName: string;
  familyName: string;
}

export interface YahooEmail {
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
  folder: string;
}

class YahooMailService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.YAHOO_CLIENT_ID || '';
    this.clientSecret = process.env.YAHOO_CLIENT_SECRET || '';
    this.redirectUri = process.env.REPLIT_DOMAIN ? 
      `${process.env.REPLIT_DOMAIN}/auth/yahoo/callback` : 
      'http://localhost:5000/auth/yahoo/callback';
  }

  getAuthUrl(): string {
    console.log('🔐 [Yahoo] Generating auth URL with config:', {
      clientId: this.clientId ? 'SET' : 'MISSING',
      redirectUri: this.redirectUri,
      scope: 'openid profile email'
    });

    // Check if client credentials are properly configured
    if (!this.clientId || !this.clientSecret) {
      console.error('❌ [Yahoo] Missing client credentials');
      throw new Error('Yahoo OAuth credentials not configured');
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: 'openid profile', // Yahoo requires approval for mail access
      state: 'yahoo_auth_' + Math.random().toString(36).substring(2, 15)
    });

    const authUrl = `https://api.login.yahoo.com/oauth2/request_auth?${params.toString()}`;
    console.log('🔐 [Yahoo] Generated auth URL:', authUrl);
    return authUrl;
  }

  async exchangeCodeForTokens(code: string): Promise<YahooTokens> {
    try {
      console.log('🔐 [Yahoo] Exchanging code for tokens...');
      
      // Create Basic Auth header
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(
        'https://api.login.yahoo.com/oauth2/get_token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri
        }),
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const data = response.data;
      console.log('🔐 [Yahoo] Token exchange successful');

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
        scope: data.scope
      };
    } catch (error) {
      console.error('❌ [Yahoo] Token exchange failed:', error.response?.data || error.message);
      throw new Error('Failed to exchange code for tokens');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<YahooTokens> {
    try {
      console.log('🔐 [Yahoo] Refreshing access token...');
      
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(
        'https://api.login.yahoo.com/oauth2/get_token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }),
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const data = response.data;
      console.log('🔐 [Yahoo] Token refresh successful');

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken, // Some providers don't return new refresh token
        expiresIn: data.expires_in,
        tokenType: data.token_type,
        scope: data.scope
      };
    } catch (error) {
      console.error('❌ [Yahoo] Token refresh failed:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  async getUserProfile(accessToken: string): Promise<YahooUserProfile> {
    try {
      console.log('👤 [Yahoo] Getting user profile...');
      
      const response = await axios.get(
        'https://api.login.yahoo.com/openid/v1/userinfo',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      const data = response.data;
      console.log('👤 [Yahoo] User profile retrieved:', { 
        id: data.sub, 
        email: data.email 
      });

      return {
        id: data.sub,
        mail: data.email,
        displayName: data.name || data.email,
        givenName: data.given_name || '',
        familyName: data.family_name || ''
      };
    } catch (error) {
      console.error('❌ [Yahoo] Failed to get user profile:', error.response?.data || error.message);
      throw new Error('Failed to get user profile');
    }
  }

  async getSpamEmails(accessToken: string, folders?: string[]): Promise<YahooEmail[]> {
    try {
      console.log('📧 [Yahoo] Fetching spam emails...');
      console.log('⚠️ [Yahoo] Mail API access requires special approval from Yahoo');
      
      // For now, return empty array since Yahoo requires approval for mail access
      // Users will need to apply for mail API access at https://senders.yahooinc.com/developer/developer-access/
      console.log('📧 [Yahoo] Returning empty array - mail access not yet approved');
      
      return [];
    } catch (error) {
      console.error('❌ [Yahoo] Failed to fetch emails:', error.response?.data || error.message);
      throw new Error('Yahoo Mail API access requires approval. Please apply at https://senders.yahooinc.com/developer/developer-access/');
    }
  }

  async getMessageDetails(accessToken: string, messageId: string): Promise<YahooEmail> {
    try {
      console.log(`📧 [Yahoo] Fetching message details for ID: ${messageId}`);
      
      const requestBody = {
        method: 'GetMessage',
        params: {
          mid: messageId,
          includeHeaders: true,
          includeMime: true
        }
      };

      const response = await axios.post(
        'https://mail.yahooapis.com/ws/mail/v1.1/jsonrpc',
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.error) {
        console.error('❌ [Yahoo] API Error:', response.data.error);
        throw new Error(response.data.error.message);
      }

      const msg = response.data.result?.message;
      if (!msg) {
        throw new Error('Message not found');
      }

      const fromHeader = msg.header?.from || '';
      const subjectHeader = msg.header?.subject || 'No Subject';
      
      const senderMatch = fromHeader.match(/(.+?)\s*<(.+?)>/) || [null, fromHeader, fromHeader];
      const senderName = senderMatch[1]?.trim() || '';
      const senderEmail = senderMatch[2]?.trim() || fromHeader;

      return {
        id: msg.mid,
        subject: subjectHeader,
        sender: {
          emailAddress: {
            address: senderEmail,
            name: senderName
          }
        },
        body: {
          content: msg.textPart || msg.htmlPart || '',
          contentType: msg.htmlPart ? 'text/html' : 'text/plain'
        },
        receivedDateTime: new Date(msg.receivedDate * 1000).toISOString(),
        folder: msg.folderId || 'Bulk'
      };
    } catch (error) {
      console.error('❌ [Yahoo] Failed to fetch message details:', error.response?.data || error.message);
      throw new Error('Failed to fetch message details');
    }
  }
}

export const yahooMailService = new YahooMailService();