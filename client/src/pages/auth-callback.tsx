import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { LoaderCircle, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(`Authentication error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        setMessage('Exchanging authorization code...');
        
        const response = await apiRequest("POST", "/api/auth/callback", { code });
        const data = await response.json();

        setStatus('success');
        setMessage('Authentication successful! Redirecting to dashboard...');

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          setLocation(`/dashboard/${data.user.id}`);
        }, 2000);

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    processCallback();
  }, [setLocation]);

  const getIcon = () => {
    switch (status) {
      case 'processing':
        return <LoaderCircle className="h-8 w-8 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-success" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-error" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'processing':
        return 'Authenticating...';
      case 'success':
        return 'Authentication Successful';
      case 'error':
        return 'Authentication Failed';
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {getTitle()}
            </h1>
            <p className="text-sm text-gray-600 mb-4">
              {message}
            </p>
            {status === 'error' && (
              <button 
                onClick={() => window.location.href = '/'}
                className="text-primary hover:text-blue-700 font-medium"
              >
                Return to Home
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
