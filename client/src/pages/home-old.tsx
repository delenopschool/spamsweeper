import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Mail, Shield, Zap } from "lucide-react";
// Outlook logo SVG
const OutlookIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <defs>
      <linearGradient id="outlookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0078d4" />
        <stop offset="100%" stopColor="#106ebe" />
      </linearGradient>
    </defs>
    <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.33-.75.22-.32.57-.51.35-.19.85-.19t.87.19q.36.19.58.51.22.32.33.75.11.42.11.87zM21.5 12v.5q0 .25-.25.25h-7q0 .32.13.62t.36.56.52.37.68.14q.59 0 1.27-.39.68-.4 1.06-.95h.44q0 .52-.27.99-.27.47-.73.84-.46.37-1.04.58-.58.21-1.26.21-.88 0-1.57-.32-.69-.33-1.17-.85-.48-.52-.73-1.17-.25-.65-.25-1.35 0-.68.25-1.33.25-.65.73-1.17.48-.52 1.17-.85.69-.32 1.57-.32.86 0 1.54.32.68.33 1.15.85.47.52.71 1.17.24.65.24 1.33zM20.75 11.5q-.02-.49-.35-.49-.17 0-.31.11-.14.12-.27.29-.13.18-.25.39-.11.21-.19.41-.07.2-.11.36-.03.16-.03.26h1.51z" fill="url(#outlookGradient)"/>
    <rect x="2" y="4" width="20" height="16" rx="2" fill="url(#outlookGradient)" fillOpacity="0.1"/>
    <circle cx="12" cy="12" r="6" fill="url(#outlookGradient)" fillOpacity="0.8"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">O</text>
  </svg>
);

// Gmail logo SVG met juiste kleuren
const GmailIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.909 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" fill="#ea4335"/>
    <path d="M0 5.457v13.909c0 .904.732 1.636 1.636 1.636h3.819V11.73L12 16.64l6.545-4.91v9.273h3.819c.904 0 1.636-.732 1.636-1.636V5.457c0-2.023-2.309-3.178-3.927-1.964L18.545 4.64 12 9.548 5.455 4.64 3.927 3.493C2.309 2.28 0 3.434 0 5.457z" fill="#4285f4"/>
    <path d="M12 16.64l6.545-4.91V5.457c0-2.023-2.309-3.178-3.927-1.964L12 4.64z" fill="#34a853"/>
    <path d="M12 16.64L5.455 11.73V5.457c0-2.023 2.309-3.178 3.927-1.964L12 4.64z" fill="#fbbc04"/>
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
                  <OutlookIcon />
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
                  <GmailIcon />
                  Connect Gmail
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12 sm:mb-16">
          <Card className="bg-card dark:bg-card border-border">
            <CardHeader className="text-center">
              <img src={automaticUnsubscribeIcon} alt="Smart Review" className="h-12 w-12 mx-auto mb-2" />
              <CardTitle className="text-foreground">AI Spam Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">
                Advanced AI analyzes your spam folder and identifies genuine spam with high accuracy, 
                reducing false positives and protecting important emails.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-card border-border">
            <CardHeader className="text-center">
              <img src={smartReviewIcon} alt="Smart Review" className="h-12 w-12 mx-auto mb-2" />
              <CardTitle className="text-foreground">Automatic Unsubscribe</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">
                Automatically detects and processes unsubscribe links in spam emails, 
                helping you get removed from unwanted mailing lists effortlessly.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-card border-border">
            <CardHeader className="text-center">
              <Zap className="h-12 w-12 text-warning mx-auto mb-2" />
              <CardTitle className="text-foreground">Smart Review Process</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">
                Review AI classifications before processing, with confidence scores and 
                detailed analysis to ensure important emails are never lost.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Your Privacy is Protected
          </h3>
          <p className="text-muted-foreground">
            We use Microsoft's official Graph API with secure OAuth 2.0 authentication. 
            Your emails are processed securely and we never store your email content permanently.
          </p>
        </div>
      </div>
    </div>
  );
}
