import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { WashingMachine, LogOut, UserRound } from "lucide-react";
import logoUrl from "@/assets/spam-sweeper-logo.png";
import StatusCards from "@/components/status-cards";
import EmailReviewTable from "@/components/email-review-table";
import ProcessingModal from "@/components/processing-modal";
import EmailPreviewModal from "@/components/email-preview-modal";
import LearningDashboard from "@/components/learning-dashboard";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const [match, params] = useRoute("/dashboard/:userId");
  const userId = params?.userId ? parseInt(params.userId) : null;
  
  const [currentScanId, setCurrentScanId] = useState<number | null>(null);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [previewEmailId, setPreviewEmailId] = useState<number | null>(null);
  const [scanData, setScanData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user", userId],
    enabled: !!userId,
  });

  // Load latest scan data when dashboard loads
  const { data: latestScanData, isLoading: latestScanLoading } = useQuery({
    queryKey: ["/api/user", userId, "latest-scan"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/user/${userId}/latest-scan`);
      return response.json();
    },
    enabled: !!userId,
  });

  // Update scanData when latest scan loads
  useEffect(() => {
    if (latestScanData && !currentScanId) {
      setScanData(latestScanData);
      if (latestScanData.scan) {
        setCurrentScanId(latestScanData.scan.id);
      }
    }
  }, [latestScanData, currentScanId]);

  // Simple fetch function for scan data
  const fetchScanData = async (scanId: number) => {
    try {
      const response = await apiRequest("GET", `/api/scan/${scanId}`);
      const data = await response.json();
      setScanData(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch scan data:", error);
      return null;
    }
  };



  const handleSignOut = () => {
    window.location.href = '/';
  };

  const handleScanEmails = async () => {
    if (!userId) return;
    
    try {
      setIsScanning(true);
      const response = await apiRequest("POST", `/api/scan/${userId}`);
      const data = await response.json();
      setCurrentScanId(data.scanId);
      
      // Start polling for results
      pollScanResults(data.scanId);
    } catch (error) {
      console.error("Scan error:", error);
      setIsScanning(false);
    }
  };

  const pollScanResults = async (scanId: number) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max
    
    const poll = async () => {
      const data = await fetchScanData(scanId);
      
      if (data && data.scan && data.scan.status === "completed") {
        setIsScanning(false);
        return;
      }
      
      if (attempts < maxAttempts && data && data.scan && data.scan.status === "processing") {
        attempts++;
        setTimeout(poll, 2000);
      } else {
        setIsScanning(false);
      }
    };
    
    poll();
  };

  const handleRefresh = () => {
    if (currentScanId) {
      fetchScanData(currentScanId);
    }
    // Also invalidate the latest scan cache
    queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "latest-scan"] });
  };

  const handleProcessUnsubscribes = async () => {
    if (!currentScanId) return;
    
    try {
      setIsProcessingModalOpen(true);
      await apiRequest("POST", `/api/process-unsubscribes/${currentScanId}`);
      // Modal will handle the progress simulation
    } catch (error) {
      console.error("Process error:", error);
      setIsProcessingModalOpen(false);
    }
  };

  if (!match || !userId) {
    return <div>Invalid URL</div>;
  }

  if (userLoading || latestScanLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>User not found</div>
      </div>
    );
  }

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
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center text-sm text-muted-foreground">
                <UserRound className="text-success text-lg mr-1" />
                <span className="truncate max-w-32 lg:max-w-none">{user.email}</span>
              </div>
              <ThemeToggle />
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="flex items-center"
                size="sm"
              >
                <LogOut className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Dashboard Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-2">Email Spam Management</h2>
          <p className="text-muted-foreground">Review AI-classified spam emails and manage your subscriptions automatically</p>
        </div>

        {/* Status Cards */}
        <StatusCards scanData={scanData} />

        {/* Learning Dashboard */}
        <LearningDashboard userId={userId} />

        {/* Action Panel */}
        <div className="bg-card rounded-lg shadow-sm border border-border mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 py-4 border-b border-border">
            <h3 className="text-lg font-medium text-foreground">Quick Actions</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                onClick={handleScanEmails}
                className="btn-primary flex items-center justify-center px-4 py-3"
                disabled={isScanning}
              >
                <WashingMachine className="mr-2" />
                {isScanning ? 'AI Processing...' : 'Scan Spam Folder'}
              </Button>
              
              <Button 
                onClick={handleRefresh}
                className="btn-success flex items-center justify-center px-4 py-3"
                disabled={!currentScanId}
              >
                <UserRound className="mr-2" />
                Refresh Results
              </Button>
              
              <Button 
                onClick={handleProcessUnsubscribes}
                className="btn-warning flex items-center justify-center px-4 py-3"
                disabled={!scanData?.emails?.some((email: any) => email.isSelected && email.hasUnsubscribeLink)}
              >
                <LogOut className="mr-2" />
                Process Unsubscribes
              </Button>
            </div>
          </div>
        </div>

        {/* Email Review Table */}
        {scanData && scanData.scan && scanData.scan.status === "processing" && (
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 sm:p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-foreground mb-2">AI Processing Emails...</h3>
            <p className="text-muted-foreground">Analyzing {scanData.scan.totalScanned} emails for spam patterns</p>
          </div>
        )}
        
        {scanData && scanData.scan && scanData.scan.status === "completed" && (
          <>
            {scanData.emails && scanData.emails.length > 0 ? (
              <EmailReviewTable 
                scanData={scanData} 
                onPreviewEmail={setPreviewEmailId}
                onRefresh={handleRefresh}
              />
            ) : (
              <div className="bg-card rounded-lg shadow-sm border border-border p-6 sm:p-8 text-center">
                <h3 className="text-lg font-medium text-foreground mb-2">Great News!</h3>
                <p className="text-muted-foreground">No spam emails detected in your {scanData.scan.totalScanned} scanned messages. Your inbox is clean!</p>
              </div>
            )}
          </>
        )}

        {/* Default state when no scan data */}
        {!scanData && !isScanning && !latestScanLoading && (
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 sm:p-8 text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">Welcome to Spam Sweeper!</h3>
            <p className="text-muted-foreground mb-4">Start by scanning your spam folder to detect unwanted emails and find unsubscribe links.</p>
            <Button 
              onClick={handleScanEmails}
              className="btn-primary flex items-center justify-center"
            >
              <WashingMachine className="mr-2" />
              Start Your First Scan
            </Button>
          </div>
        )}

        {/* Modals */}
        <ProcessingModal 
          isOpen={isProcessingModalOpen}
          onClose={() => setIsProcessingModalOpen(false)}
          emailCount={scanData?.emails?.filter((email: any) => email.isSelected && email.hasUnsubscribeLink)?.length || 0}
        />

        <EmailPreviewModal 
          emailId={previewEmailId}
          isOpen={!!previewEmailId}
          onClose={() => setPreviewEmailId(null)}
        />
      </div>
    </div>
  );
}
