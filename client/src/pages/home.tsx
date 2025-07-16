import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Mail, Shield, Zap } from "lucide-react";
import outlookIcon from "@/assets/outlook.png";
import gmailIcon from "@/assets/gmail.png";

// Outlook logo - eenvoudig en accuraat
const OutlookIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <rect x="2" y="4" width="20" height="16" rx="2" fill="#0078d4"/>
    <circle cx="8" cy="12" r="4" fill="white"/>
    <text x="8" y="15" textAnchor="middle" fill="#0078d4" fontSize="7" fontWeight="bold">O</text>
  </svg>
);

// Gmail logo - met juiste kleuren
const GmailIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path d="M6 7l6 4 6-4v12H6z" fill="#ea4335"/>
    <path d="M2 7l6 4v9H4c-1.1 0-2-.9-2-2V7z" fill="#4285f4"/>
    <path d="M22 7v11c0 1.1-.9 2-2 2h-4v-9l6-4z" fill="#34a853"/>
    <path d="M8 11l-6-4h20l-6 4-4-3-4 3z" fill="#fbbc04"/>
  </svg>
);

import logoUrl from "@/assets/spam-sweeper-logo.png";
import smartReviewIcon from "@/assets/broom-svgrepo-com.png";
import automaticUnsubscribeIcon from "@/assets/ai-svgrepo-com.png";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authProvider, setAuthProvider] = useState<string>("");

  const handleMicrosoftAuth = async () => {
    try {
      setIsAuthenticating(true);
      setAuthProvider("microsoft");
      const response = await apiRequest("GET", "/api/auth/microsoft");
      const data = await response.json();
      
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Authentication error:", error);
      setIsAuthenticating(false);
      setAuthProvider("");
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsAuthenticating(true);
      setAuthProvider("google");
      const response = await apiRequest("GET", "/api/auth/google");
      const data = await response.json();
      
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Authentication error:", error);
      setIsAuthenticating(false);
      setAuthProvider("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={logoUrl} alt="Spam Sweeper Logo" className="h-10 w-10 sm:h-12 sm:w-12 mr-3 rounded-lg" style={{ borderRadius: '7px' }} />
              <h1 className="text-lg sm:text-xl font-medium text-foreground">Spam Sweeper</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            AI-Powered Email Spam Management
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto px-4">
            Connect your email account and let AI automatically identify spam emails, 
            find unsubscribe links, and clean up your inbox with intelligent automation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleMicrosoftAuth}
              disabled={isAuthenticating}
              className="bg-[#0078d4] hover:bg-[#106ebe] text-white border-0 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg shadow-lg transition-all duration-200"
            >
              {isAuthenticating && authProvider === "microsoft" ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <img src={outlookIcon} alt="Smart Review" className="w-6 h-6" />
                  Connect Outlook
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleGoogleAuth}
              disabled={isAuthenticating}
              className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 hover:border-gray-400 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg shadow-lg transition-all duration-200"
            >
              {isAuthenticating && authProvider === "google" ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#ea4335] mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <img src={gmailIcon} alt="Smart Review" className="w-6 h-6" />
                  Connect Gmail
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12 sm:mb-16">
          <Card className="bg-card dark:bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <img src={smartReviewIcon} alt="Smart Review" className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl text-center text-foreground">Smart Review</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-center text-muted-foreground">
                AI automatically scans your spam folder and identifies emails with high confidence scores, 
                making it easy to review and clean up your inbox.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <Zap className="h-12 w-12 text-warning mx-auto mb-2" />
              </div>
              <CardTitle className="text-xl text-center text-foreground">Automatic Unsubscribe</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-center text-muted-foreground">
                Automatically finds and processes unsubscribe links from legitimate emails, 
                helping you reduce future spam without compromising your email security.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <img src={automaticUnsubscribeIcon} alt="AI Powered" className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl text-center text-foreground">AI Powered</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-center text-muted-foreground">
                Uses advanced language models to understand email content and context, 
                providing intelligent spam detection with detailed reasoning for each decision.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">1</div>
              <h3 className="text-lg font-medium text-foreground mb-2">Connect Account</h3>
              <p className="text-muted-foreground">Sign in with your email provider to grant secure access to your spam folder.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">2</div>
              <h3 className="text-lg font-medium text-foreground mb-2">AI Analysis</h3>
              <p className="text-muted-foreground">Our AI scans your spam emails and finds unsubscribe links automatically.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">3</div>
              <h3 className="text-lg font-medium text-foreground mb-2">Clean Inbox</h3>
              <p className="text-muted-foreground">Review results and process unsubscribes to reduce future spam.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Ready to clean up your inbox?</h2>
          <p className="text-lg text-muted-foreground mb-8">Get started in seconds with your existing email account.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleMicrosoftAuth}
              disabled={isAuthenticating}
              className="bg-[#0078d4] hover:bg-[#106ebe] text-white border-0 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg shadow-lg transition-all duration-200"
            >
              {isAuthenticating && authProvider === "microsoft" ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <img src={outlookIcon} alt="Smart Review" className="w-6 h-6" />
                  Connect Outlook
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleGoogleAuth}
              disabled={isAuthenticating}
              className="bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 hover:border-gray-400 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg shadow-lg transition-all duration-200"
            >
              {isAuthenticating && authProvider === "google" ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#ea4335] mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <img src={gmailIcon} alt="Smart Review" className="w-6 h-6" />
                  Connect Gmail
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}