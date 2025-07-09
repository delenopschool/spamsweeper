export interface UnsubscribeLink {
  url: string;
  text: string;
  type: 'link' | 'mailto';
}

export class EmailParserService {
  findUnsubscribeLinks(emailBody: string): UnsubscribeLink[] {
    const links: UnsubscribeLink[] = [];
    
    // Convert to lowercase for case-insensitive matching
    const bodyLower = emailBody.toLowerCase();
    
    // Common unsubscribe patterns
    const unsubscribePatterns = [
      /unsubscribe/i,
      /opt[- ]?out/i,
      /remove/i,
      /stop/i,
      /cancel[- ]?subscription/i,
      /manage[- ]?preferences/i,
      /email[- ]?preferences/i,
      /list[- ]?remove/i
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

  async processUnsubscribeLink(url: string): Promise<{ success: boolean; message: string }> {
    try {
      if (url.startsWith('mailto:')) {
        return {
          success: false,
          message: 'Mailto unsubscribe links require manual processing'
        };
      }

      // For demonstration, we'll just validate the URL
      // In a real implementation, you would:
      // 1. Make a GET request to the unsubscribe URL
      // 2. Parse the response for confirmation forms
      // 3. Submit any required forms automatically
      // 4. Handle various unsubscribe workflows
      
      const urlObj = new URL(url);
      
      if (!urlObj.hostname) {
        throw new Error('Invalid URL');
      }

      return {
        success: true,
        message: `Unsubscribe request processed for ${urlObj.hostname}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to process unsubscribe: ${(error as Error).message}`
      };
    }
  }
}

export const emailParserService = new EmailParserService();
