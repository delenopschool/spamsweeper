import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RotateCw } from "lucide-react";

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailCount: number;
}

export default function ProcessingModal({ isOpen, onClose, emailCount }: ProcessingModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentEmail, setCurrentEmail] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && emailCount > 0) {
      setIsProcessing(true);
      setProgress(0);
      setCurrentEmail(0);

      const interval = setInterval(() => {
        setCurrentEmail(prev => {
          const next = prev + 1;
          const newProgress = (next / emailCount) * 100;
          setProgress(newProgress);
          
          if (next >= emailCount) {
            clearInterval(interval);
            setIsProcessing(false);
            setTimeout(() => {
              onClose();
            }, 2000);
          }
          
          return next;
        });
      }, 500); // Process one email every 500ms for demonstration

      return () => clearInterval(interval);
    }
  }, [isOpen, emailCount, onClose]);

  const handleCancel = () => {
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 animate-scale-in">
        <DialogHeader className="animate-slide-in">
          <DialogTitle className="flex items-center justify-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4 animate-bounce-in">
              <RotateCw className={`text-blue-600 dark:text-blue-400 text-2xl ${isProcessing ? 'animate-spin' : ''}`} />
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center animate-fade-in">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-2">
            {isProcessing ? 'Processing Unsubscribes' : 'Processing Complete'}
          </h3>
          
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {isProcessing 
                ? 'Automatically unsubscribing from selected spam emails...'
                : 'All unsubscribe requests have been processed!'
              }
            </p>
            
            <div className="w-full mb-4">
              <Progress value={progress} className="w-full h-2 bg-gray-200 dark:bg-gray-700" />
            </div>
            
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {isProcessing 
                ? `Processing ${currentEmail} of ${emailCount} emails`
                : `Completed ${emailCount} unsubscribe requests`
              }
            </p>
          </div>
          
          <div className="mt-4">
            {isProcessing ? (
              <Button
                variant="outline"
                onClick={handleCancel}
                className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel Processing
              </Button>
            ) : (
              <Button
                onClick={onClose}
                className="btn-success w-full transition-all duration-300 hover:scale-105"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
