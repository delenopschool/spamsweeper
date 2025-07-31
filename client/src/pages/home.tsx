import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Shield, Zap } from "lucide-react";
import { Link } from "wouter";
import { Footer } from "@/components/Footer";
import outlookIcon from "@/assets/outlook.png";
import gmailIcon from "@/assets/gmail.png";
import yahooIcon from "@/assets/yahoo.png";
import logoUrl from "@/assets/spam-sweeper-logo.png";
import smartReviewIcon from "@/assets/broom-svgrepo-com.png";
import automaticUnsubscribeIcon from "@/assets/ai-svgrepo-com.png";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const { t } = useLanguage();
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

  const handleYahooAuth = async () => {
    try {
      setIsAuthenticating(true);
      setAuthProvider("yahoo");
      
      // Show info about Yahoo Mail API requirements
      const proceed = confirm(t.homepage.yahooWarning);
      
      if (!proceed) {
        setIsAuthenticating(false);
        setAuthProvider("");
        return;
      }
      
      const response = await apiRequest("GET", "/api/auth/yahoo");
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
            <div className="flex items-center gap-4">
              <Link href="/privacy">
                <Button variant="ghost">{t.homepage.privacy}</Button>
              </Link>
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t.homepage.title}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto px-4">
            {t.homepage.subtitle}
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
                  {t.homepage.connecting}
                </>
              ) : (
                <>
                  <img src={outlookIcon} alt="Outlook" className="w-6 h-6" />
                  {t.homepage.connectOutlook}
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
                  {t.homepage.connecting}
                </>
              ) : (
                <>
                  <img src={gmailIcon} alt="Gmail" className="w-6 h-6" />
                  {t.homepage.connectGmail}
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleYahooAuth}
              disabled={isAuthenticating}
              className="bg-[#9d4fff] hover:bg-[#350075] text-white border-0 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg shadow-lg transition-all duration-200"
            >
              {isAuthenticating && authProvider === "yahoo" ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t.homepage.connecting}
                </>
              ) : (
                <>
                  <img src={yahooIcon} alt="Yahoo" className="w-6 h-6" />
                  {t.homepage.connectYahoo}
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
                <Zap className="h-12 w-12 text-warning" />
              </div>
              <CardTitle className="text-xl text-center text-foreground">{t.homepage.features.smartReview.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-center text-muted-foreground">
                {t.homepage.features.smartReview.description}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <img src={smartReviewIcon} alt="Auto Unsubscribe" className="w-12 h-12" />
              </div>
              <CardTitle className="text-xl text-center text-foreground">{t.homepage.features.autoUnsubscribe.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-center text-muted-foreground">
                {t.homepage.features.autoUnsubscribe.description}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card dark:bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <img src={automaticUnsubscribeIcon} alt="AI Powered" className="w-1/15 h-1/15" />
              </div>
              <CardTitle className="text-xl text-center text-foreground">{t.homepage.features.aiPowered.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-center text-muted-foreground">
                {t.homepage.features.aiPowered.description}
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">{t.homepage.howItWorks.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">1</div>
              <h3 className="text-lg font-medium text-foreground mb-2">{t.homepage.howItWorks.step1.title}</h3>
              <p className="text-muted-foreground">{t.homepage.howItWorks.step1.description}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">2</div>
              <h3 className="text-lg font-medium text-foreground mb-2">{t.homepage.howItWorks.step2.title}</h3>
              <p className="text-muted-foreground">{t.homepage.howItWorks.step2.description}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">3</div>
              <h3 className="text-lg font-medium text-foreground mb-2">{t.homepage.howItWorks.step3.title}</h3>
              <p className="text-muted-foreground">{t.homepage.howItWorks.step3.description}</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">{t.homepage.cta.title}</h2>
          <p className="text-lg text-muted-foreground mb-8">{t.homepage.cta.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleMicrosoftAuth}
              disabled={isAuthenticating}
              className="bg-[#0078d4] hover:bg-[#106ebe] text-white border-0 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg shadow-lg transition-all duration-200"
            >
              {isAuthenticating && authProvider === "microsoft" ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t.homepage.connecting}
                </>
              ) : (
                <>
                  <img src={outlookIcon} alt="Outlook" className="w-6 h-6" />
                  {t.homepage.connectOutlook}
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
                  {t.homepage.connecting}
                </>
              ) : (
                <>
                  <img src={gmailIcon} alt="Gmail" className="w-6 h-6" />
                  {t.homepage.connectGmail}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}