import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { WashingMachine, LogOut, UserRound } from "lucide-react";
import logoUrl from "@/assets/spam-sweeper-logo.png";
import StatusCards from "@/components/status-cards";
import EmailReviewTable from "@/components/email-review-table";
import ProcessingModal from "@/components/processing-modal";
import EmailPreviewModal from "@/components/email-preview-modal";
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
      
      if (data && data.scan.status === "completed") {
        setIsScanning(false);
        return;
      }
      
      if (attempts < maxAttempts && data && data.scan.status === "processing") {
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

  if (userLoading) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={logoUrl} alt="Spam Sweeper Logo" className="h-12 w-12 mr-3 rounded-lg" style={{ borderRadius: '7px' }} />
              <h1 className="text-xl font-medium text-gray-900">Spam Sweeper</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <UserRound className="text-success text-lg mr-1" />
                <span>{user.email}</span>
              </div>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="flex items-center"
              >
                <LogOut className="mr-1 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">Email Spam Management</h2>
          <p className="text-gray-600">Review AI-classified spam emails and manage your subscriptions automatically</p>
        </div>

        {/* Status Cards */}
        <StatusCards scanData={scanData} />

        {/* Action Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        {scanData && scanData.scan.status === "processing" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">AI Processing Emails...</h3>
            <p className="text-gray-600">Analyzing {scanData.scan.totalScanned} emails for spam patterns</p>
          </div>
        )}
        
        {scanData && scanData.scan.status === "completed" && (
          <>
            {scanData.emails.length > 0 ? (
              <EmailReviewTable 
                scanData={scanData} 
                onPreviewEmail={setPreviewEmailId}
                onRefresh={refetchScan}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Great News!</h3>
                <p className="text-gray-600">No spam emails detected in your {scanData.scan.totalScanned} scanned messages. Your inbox is clean!</p>
              </div>
            )}
          </>
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
