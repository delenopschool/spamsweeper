import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Mail, Shield, Zap } from "lucide-react";
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
              className="btn-primary px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg"
            >
              {isAuthenticating && authProvider === "microsoft" ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Connect Outlook
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleGoogleAuth}
              disabled={isAuthenticating}
              variant="outline"
              className="px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg"
            >
              {isAuthenticating && authProvider === "google" ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
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
