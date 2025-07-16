import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, AlertTriangle, Link2Off, CheckCircle } from "lucide-react";

interface StatusCardsProps {
  scanData?: {
    scan: {
      totalScanned: number;
      detectedSpam: number;
      unsubscribeLinks: number;
      processed: number;
    };
  };
}

const StatusCards = React.memo(function StatusCards({ scanData }: StatusCardsProps) {
  const stats = {
    totalScanned: scanData?.scan?.totalScanned ?? 0,
    detectedSpam: scanData?.scan?.detectedSpam ?? 0,
    unsubscribeLinks: scanData?.scan?.unsubscribeLinks ?? 0,
    processed: scanData?.scan?.processed ?? 0,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      <Card className="bg-card dark:bg-card border-border hover:shadow-lg transition-all duration-300 animate-fade-in">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center">
            <Mail className="text-blue-600 dark:text-blue-400 text-xl sm:text-2xl mr-3 flex-shrink-0 animate-float" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Total Emails Scanned</p>
              <p className="text-xl sm:text-2xl font-semibold text-foreground transition-all duration-300">
                {stats.totalScanned.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card dark:bg-card border-border hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center">
            <AlertTriangle className="text-red-600 dark:text-red-400 text-xl sm:text-2xl mr-3 flex-shrink-0 animate-float" style={{ animationDelay: '0.5s' }} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">AI Detected Spam</p>
              <p className="text-xl sm:text-2xl font-semibold text-foreground transition-all duration-300">
                {stats.detectedSpam.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card dark:bg-card border-border hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center">
            <Link2Off className="text-amber-600 dark:text-amber-400 text-xl sm:text-2xl mr-3 flex-shrink-0 animate-float" style={{ animationDelay: '1s' }} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Unsubscribe Links</p>
              <p className="text-xl sm:text-2xl font-semibold text-foreground transition-all duration-300">
                {stats.unsubscribeLinks.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card dark:bg-card border-border hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center">
            <CheckCircle className="text-green-600 dark:text-green-400 text-xl sm:text-2xl mr-3 flex-shrink-0 animate-float" style={{ animationDelay: '1.5s' }} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Successfully Processed</p>
              <p className={`text-xl sm:text-2xl font-semibold text-foreground transition-all duration-300 ${stats.processed > 0 ? 'animate-pulse-success' : ''}`}>
                {stats.processed.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default StatusCards;
