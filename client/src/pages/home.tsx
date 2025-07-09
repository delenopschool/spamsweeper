import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WashingMachine, Mail, Shield, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleMicrosoftAuth = async () => {
    try {
      setIsAuthenticating(true);
      const response = await apiRequest("GET", "/api/auth/microsoft");
      const data = await response.json();
      
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Authentication error:", error);
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <WashingMachine className="text-primary text-2xl mr-2" />
              <h1 className="text-xl font-medium text-gray-900">SpamClean</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Email Spam Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect your Outlook account and let AI automatically identify spam emails, 
            find unsubscribe links, and clean up your inbox with intelligent automation.
          </p>
          
          <Button 
            onClick={handleMicrosoftAuth}
            disabled={isAuthenticating}
            className="btn-primary px-8 py-3 text-lg"
          >
            {isAuthenticating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connecting...
              </>
            ) : (
              <>
                <Mail className="mr-2" />
                Connect Outlook Account
              </>
            )}
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>AI Spam Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Advanced AI analyzes your spam folder and identifies genuine spam with high accuracy, 
                reducing false positives and protecting important emails.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-warning mb-2" />
              <CardTitle>Automatic Unsubscribe</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatically detects and processes unsubscribe links in spam emails, 
                helping you get removed from unwanted mailing lists effortlessly.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <WashingMachine className="h-8 w-8 text-success mb-2" />
              <CardTitle>Smart Review Process</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Review AI classifications before processing, with confidence scores and 
                detailed analysis to ensure important emails are never lost.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your Privacy is Protected
          </h3>
          <p className="text-gray-600">
            We use Microsoft's official Graph API with secure OAuth 2.0 authentication. 
            Your emails are processed securely and we never store your email content permanently.
          </p>
        </div>
      </div>
    </div>
  );
}
