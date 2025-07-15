export interface UnsubscribeLink {
  url: string;
  text: string;
  type: 'link' | 'mailto';
}

export interface UnsubscribeResult {
  success: boolean;
  message: string;
  method?: 'GET' | 'POST' | 'MAILTO' | 'FORM';
  details?: string;
}

export class EmailParserService {
  findUnsubscribeLinks(emailBody: string): UnsubscribeLink[] {
    const links: UnsubscribeLink[] = [];
    
    // Convert to lowercase for case-insensitive matching
    const bodyLower = emailBody.toLowerCase();
    
    // Multilingual unsubscribe patterns
    const unsubscribePatterns = [
      // English patterns
      /unsubscribe/i,
      /opt[- ]?out/i,
      /remove/i,
      /stop/i,
      /cancel[- ]?subscription/i,
      /manage[- ]?preferences/i,
      /email[- ]?preferences/i,
      /list[- ]?remove/i,
      /no[- ]?longer[- ]?receive/i,
      /update[- ]?preferences/i,
      
      // Dutch patterns
      /uitschrijven/i,
      /afmelden/i,
      /afzeggen/i,
      /verwijderen/i,
      /stoppen/i,
      /geen[- ]?emails[- ]?meer/i,
      /email[- ]?voorkeuren/i,
      /abonnement[- ]?opzeggen/i,
      /niet[- ]?meer[- ]?ontvangen/i,
      /voorkeuren[- ]?beheren/i,
      
      // German patterns
      /abmelden/i,
      /abbestellen/i,
      /austragen/i,
      /kündigen/i,
      /entfernen/i,
      /stoppen/i,
      /keine[- ]?emails[- ]?mehr/i,
      /email[- ]?einstellungen/i,
      /newsletter[- ]?abmelden/i,
      /nicht[- ]?mehr[- ]?erhalten/i,
      /einstellungen[- ]?verwalten/i,
      
      // French patterns
      /désabonner/i,
      /se[- ]?désinscrire/i,
      /annuler/i,
      /supprimer/i,
      /arrêter/i,
      /plus[- ]?d['\']emails/i,
      /préférences[- ]?email/i,
      /gérer[- ]?préférences/i,
      /ne[- ]?plus[- ]?recevoir/i,
      /modifier[- ]?abonnement/i
    ];

    // Extract all links from HTML
    const linkMatches = emailBody.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi);
    
    for (const match of linkMatches) {
      const url = match[1];
      const text = match[2].trim();
      
      // Check if link text contains unsubscribe keywords
      const isUnsubscribeLink = unsubscribePatterns.some(pattern => 
        pattern.test(text) || pattern.test(url)
      );
      
      if (isUnsubscribeLink) {
        links.push({
          url: url.startsWith('http') ? url : `https://${url}`,
          text,
          type: url.startsWith('mailto:') ? 'mailto' : 'link'
        });
      }
    }

    // Also check for mailto links with unsubscribe subjects
    const mailtoMatches = emailBody.matchAll(/mailto:([^?\s"'<>]+)(\?[^"'<>\s]*)?/gi);
    
    for (const match of mailtoMatches) {
      const email = match[1];
      const params = match[2] || '';
      
      // Check if it's an unsubscribe email
      if (unsubscribePatterns.some(pattern => 
        pattern.test(email) || pattern.test(params)
      )) {
        links.push({
          url: match[0],
          text: `Unsubscribe via ${email}`,
          type: 'mailto'
        });
      }
    }

    // Remove duplicates
    return links.filter((link, index, self) => 
      self.findIndex(l => l.url === link.url) === index
    );
  }

  extractTextFromHtml(html: string): string {
    // Remove HTML tags and decode entities
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  async processUnsubscribeLink(url: string): Promise<UnsubscribeResult> {
    try {
      if (url.startsWith('mailto:')) {
        return await this.processMailtoUnsubscribe(url);
      }

      const urlObj = new URL(url);
      
      if (!urlObj.hostname) {
        throw new Error('Invalid URL');
      }

      // Try GET request first (most common)
      const getResult = await this.tryGetUnsubscribe(url);
      if (getResult.success) {
        return getResult;
      }

      // If GET fails, try to find and submit forms
      const formResult = await this.tryFormUnsubscribe(url);
      return formResult;

    } catch (error) {
      return {
        success: false,
        message: `Failed to process unsubscribe: ${(error as Error).message}`,
        method: 'GET'
      };
    }
  }

  private async processMailtoUnsubscribe(url: string): Promise<UnsubscribeResult> {
    // Extract email and subject from mailto link
    const emailMatch = url.match(/mailto:([^?]+)(\?(.*))?/);
    if (!emailMatch) {
      return {
        success: false,
        message: 'Invalid mailto URL format',
        method: 'MAILTO'
      };
    }

    const email = emailMatch[1];
    const params = emailMatch[3] || '';
    
    // For security and practical reasons, we don't automatically send emails
    // Instead, we return success with instructions
    return {
      success: true,
      message: `Unsubscribe email prepared for ${email}`,
      method: 'MAILTO',
      details: `Send email to ${email}${params ? ` with parameters: ${params}` : ''}`
    };
  }

  private async tryGetUnsubscribe(url: string): Promise<UnsubscribeResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        signal: controller.signal,
        redirect: 'follow'
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const html = await response.text();
        
        // Check for success indicators in the response
        const successIndicators = [
          // English
          /unsubscribed/i, /successfully removed/i, /no longer receive/i, /opted out/i,
          // Dutch  
          /uitgeschreven/i, /succesvol afgemeld/i, /niet meer ontvangen/i,
          // German
          /abgemeldet/i, /erfolgreich entfernt/i, /nicht mehr erhalten/i,
          // French
          /désabonné/i, /supprimé avec succès/i, /ne recevrez plus/i
        ];

        const isSuccess = successIndicators.some(pattern => pattern.test(html));
        
        return {
          success: isSuccess,
          message: isSuccess 
            ? `Successfully unsubscribed via GET request to ${new URL(url).hostname}`
            : `GET request completed but unsubscribe status unclear for ${new URL(url).hostname}`,
          method: 'GET',
          details: `HTTP ${response.status} response received`
        };
      } else {
        return {
          success: false,
          message: `GET request failed with status ${response.status}`,
          method: 'GET'
        };
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          message: 'Request timed out after 10 seconds',
          method: 'GET'
        };
      }
      
      return {
        success: false,
        message: `GET request failed: ${(error as Error).message}`,
        method: 'GET'
      };
    }
  }

  private async tryFormUnsubscribe(url: string): Promise<UnsubscribeResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // First, get the page to look for forms
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          message: `Form page request failed with status ${response.status}`,
          method: 'FORM'
        };
      }

      const html = await response.text();
      
      // Look for forms with unsubscribe-related elements
      const formMatches = html.matchAll(/<form[^>]*>[\s\S]*?<\/form>/gi);
      
      for (const formMatch of formMatches) {
        const formHtml = formMatch[0];
        
        // Check if this form looks like an unsubscribe form
        const unsubscribeFormPatterns = [
          /unsubscribe/i, /opt[- ]?out/i, /remove/i, /uitschrijven/i, /afmelden/i,
          /abmelden/i, /désabonner/i, /confirm/i, /bevestigen/i, /bestätigen/i, /confirmer/i
        ];
        
        const isUnsubscribeForm = unsubscribeFormPatterns.some(pattern => 
          pattern.test(formHtml)
        );
        
        if (isUnsubscribeForm) {
          // Try to submit the form (simplified - just POST to same URL)
          try {
            const postResult = await this.submitUnsubscribeForm(url, formHtml);
            if (postResult.success) {
              return postResult;
            }
          } catch (error) {
            console.error('Form submission failed:', error);
          }
        }
      }
      
      return {
        success: false,
        message: `No suitable unsubscribe form found on ${new URL(url).hostname}`,
        method: 'FORM'
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Form processing failed: ${(error as Error).message}`,
        method: 'FORM'
      };
    }
  }

  private async submitUnsubscribeForm(url: string, formHtml: string): Promise<UnsubscribeResult> {
    try {
      // Extract form action and method
      const actionMatch = formHtml.match(/action=["']([^"']+)["']/i);
      const methodMatch = formHtml.match(/method=["']([^"']+)["']/i);
      
      const baseUrl = new URL(url);
      const action = actionMatch ? actionMatch[1] : url;
      const method = methodMatch ? methodMatch[1].toUpperCase() : 'POST';
      
      // Resolve relative URLs
      const submitUrl = action.startsWith('http') ? action : new URL(action, baseUrl).href;
      
      // Extract form fields (simplified)
      const formData = new FormData();
      const inputMatches = formHtml.matchAll(/<input[^>]*>/gi);
      
      for (const inputMatch of inputMatches) {
        const input = inputMatch[0];
        const nameMatch = input.match(/name=["']([^"']+)["']/i);
        const valueMatch = input.match(/value=["']([^"']+)["']/i);
        const typeMatch = input.match(/type=["']([^"']+)["']/i);
        
        if (nameMatch) {
          const name = nameMatch[1];
          const value = valueMatch ? valueMatch[1] : '';
          const type = typeMatch ? typeMatch[1].toLowerCase() : 'text';
          
          // Set default values for common form fields
          if (type === 'submit' || type === 'button') {
            formData.append(name, value || 'Unsubscribe');
          } else if (type === 'hidden') {
            formData.append(name, value);
          } else if (name.toLowerCase().includes('email')) {
            formData.append(name, 'user@example.com'); // Placeholder
          } else if (name.toLowerCase().includes('confirm')) {
            formData.append(name, '1');
          } else {
            formData.append(name, value);
          }
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(submitUrl, {
        method: method as 'POST' | 'GET',
        body: method === 'POST' ? formData : undefined,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': url
        },
        signal: controller.signal,
        redirect: 'follow'
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const responseText = await response.text();
        
        // Check for success indicators
        const successIndicators = [
          /unsubscribed/i, /successfully removed/i, /opted out/i, /no longer receive/i,
          /uitgeschreven/i, /succesvol afgemeld/i, /niet meer ontvangen/i,
          /abgemeldet/i, /erfolgreich entfernt/i, /nicht mehr erhalten/i,
          /désabonné/i, /supprimé avec succès/i, /ne recevrez plus/i
        ];

        const isSuccess = successIndicators.some(pattern => pattern.test(responseText));
        
        return {
          success: isSuccess,
          message: isSuccess 
            ? `Successfully submitted unsubscribe form to ${new URL(submitUrl).hostname}`
            : `Form submitted but unsubscribe status unclear for ${new URL(submitUrl).hostname}`,
          method: 'FORM',
          details: `${method} request to ${submitUrl} returned HTTP ${response.status}`
        };
      } else {
        return {
          success: false,
          message: `Form submission failed with status ${response.status}`,
          method: 'FORM'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Form submission error: ${(error as Error).message}`,
        method: 'FORM'
      };
    }
  }
}

export const emailParserService = new EmailParserService();
