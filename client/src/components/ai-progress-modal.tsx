import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bot, Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AIProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanId: number | null;
  onComplete: (scanData: any) => void;
}

export default function AIProgressModal({ isOpen, onClose, scanId, onComplete }: AIProgressModalProps) {
  const [scanData, setScanData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    if (isOpen && scanId) {
      setIsLoading(true);
      setError(null);
      setScanData(null); // Reset scan data when modal opens
      setPollCount(0);
      setStartTime(Date.now());
      pollScanProgress();
    }
  }, [isOpen, scanId]);

  const pollScanProgress = async () => {
    if (!scanId) return;

    // Check for timeout (5 minutes maximum)
    const elapsed = Date.now() - startTime;
    const maxTimeout = 5 * 60 * 1000; // 5 minutes
    
    if (elapsed > maxTimeout) {
      setIsLoading(false);
      setError("De scan duurt te lang. Probeer het opnieuw of kies minder emails.");
      return;
    }

    try {
      const response = await apiRequest("GET", `/api/scan/${scanId}`);
      const data = await response.json();
      console.log("🔄 Progress poll result:", data.scan);
      setScanData(data);
      setPollCount(prev => prev + 1);

      if (data.scan.status === "completed") {
        setIsLoading(false);
        onComplete(data);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else if (data.scan.status === "failed") {
        setIsLoading(false);
        setError("De scan is mislukt. Probeer het opnieuw.");
      } else if (data.scan.status === "processing" || data.scan.status === "pending") {
        // Check if progress is stuck (same progress for more than 30 polls = ~30 seconds)
        if (pollCount > 30 && data.scan.currentProgress > 0) {
          const timeSinceStart = Math.floor(elapsed / 1000);
          if (timeSinceStart > 60) { // If stuck for more than 1 minute
            setError(`De scan lijkt vast te lopen bij email ${data.scan.currentProgress}. Probeer het opnieuw.`);
            setIsLoading(false);
            return;
          }
        }
        
        // Continue polling for both processing and pending states
        setTimeout(pollScanProgress, 1000);
      }
    } catch (error) {
      console.error("Error polling scan progress:", error);
      setError("Er is een fout opgetreden bij het ophalen van de voortgang.");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsLoading(false);
    onClose();
  };

  const getProgressPercentage = () => {
    if (!scanData?.scan) return 0;
    if (scanData.scan.totalScanned === 0) return 0;
    const progress = Math.min(100, Math.max(0, (scanData.scan.currentProgress / scanData.scan.totalScanned) * 100));
    console.log(`📊 Progress: ${scanData.scan.currentProgress}/${scanData.scan.totalScanned} = ${progress}%`);
    return progress;
  };

  const getStatusText = () => {
    if (!scanData?.scan) return "Voorbereiden...";
    
    if (scanData.scan.status === "pending") {
      return "Emails ophalen...";
    } else if (scanData.scan.status === "processing") {
      return "AI analyseert emails...";
    } else if (scanData.scan.status === "completed") {
      return "Analyse voltooid!";
    } else if (scanData.scan.status === "failed") {
      return "Analyse mislukt";
    }
    return "Bezig...";
  };

  const getProgressText = () => {
    if (!scanData?.scan) return "Voorbereiden...";
    
    if (scanData.scan.status === "pending") {
      return "Emails ophalen van je provider...";
    } else if (scanData.scan.status === "processing") {
      return `Email ${scanData.scan.currentProgress} van ${scanData.scan.totalScanned} wordt geanalyseerd`;
    } else if (scanData.scan.status === "completed") {
      return `${scanData.scan.detectedSpam} spam emails gedetecteerd van ${scanData.scan.totalScanned} emails`;
    } else if (scanData.scan.status === "failed") {
      return "Er is een fout opgetreden tijdens de analyse";
    }
    return "Bezig...";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
              {scanData?.scan?.status === "completed" ? (
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : scanData?.scan?.status === "failed" ? (
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              ) : (
                <Bot className={`h-6 w-6 text-blue-600 dark:text-blue-400 ${isLoading ? 'animate-pulse' : ''}`} />
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-2">
            {getStatusText()}
          </h3>
          
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {getProgressText()}
            </p>
            
            {scanData?.scan && (
              <div className="w-full mb-4">
                <Progress 
                  value={getProgressPercentage()} 
                  className="w-full h-3 bg-gray-200 dark:bg-gray-700" 
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0</span>
                  <span>{Math.round(getProgressPercentage())}%</span>
                  <span>{scanData.scan.totalScanned}</span>
                </div>
              </div>
            )}
            
            {scanData?.scan?.status === "processing" && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>AI analyseert email content...</span>
              </div>
            )}
            
            {scanData?.scan?.status === "completed" && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Analyse voltooid!</span>
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {scanData.scan.detectedSpam} spam emails gedetecteerd
                  {scanData.scan.unsubscribeLinks > 0 && (
                    <span> • {scanData.scan.unsubscribeLinks} unsubscribe links gevonden</span>
                  )}
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">Fout opgetreden</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            {scanData?.scan?.status === "completed" ? (
              <Button
                onClick={onClose}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Resultaten bekijken
              </Button>
            ) : isLoading ? (
              <Button
                variant="outline"
                onClick={handleCancel}
                className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Annuleren
              </Button>
            ) : (
              <Button
                onClick={onClose}
                className="w-full"
              >
                Sluiten
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}