import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Shield, Link as LinkIcon, ThumbsUp, ThumbsDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmailPreviewModalProps {
  emailId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailPreviewModal({ emailId, isOpen, onClose }: EmailPreviewModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: email, isLoading } = useQuery({
    queryKey: ["/api/email", emailId],
    enabled: !!emailId && isOpen,
  });

  const feedbackMutation = useMutation({
    mutationFn: async (feedback: "spam" | "not_spam") => {
      const response = await fetch(`/api/email/${emailId}/feedback`, {
        method: "POST",
        body: JSON.stringify({ feedback }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback saved",
        description: "Thank you for helping improve our AI!"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scan"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Er ging iets mis bij het opslaan van je feedback",
        variant: "destructive"
      });
    }
  });

  if (!isOpen || !emailId) return null;

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) {
      return <Badge className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 animate-pulse-success">{confidence}% Spam Confidence</Badge>;
    } else if (confidence >= 60) {
      return <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 animate-pulse-success">{confidence}% Spam Confidence</Badge>;
    } else {
      return <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 animate-pulse-success">{confidence}% Spam Confidence</Badge>;
    }
  };

  const renderEmailBody = (body: string) => {
    // Simple HTML sanitization - in production, use a proper sanitization library
    const cleanBody = body
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/javascript:/gi, '');
    
    return { __html: cleanBody };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 animate-scale-in">
        <DialogHeader className="animate-slide-in">
          <DialogTitle className="text-gray-900 dark:text-gray-100">Email Preview</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Review this email classified as spam by AI
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8 animate-fade-in">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading email...</span>
          </div>
        ) : email ? (
          <div className="overflow-y-auto max-h-[70vh] animate-fade-in">
            {/* Email Header */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 animate-slide-in">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center animate-bounce-in">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {email.sender.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{email.sender}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(email.receivedDate).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getConfidenceBadge(email.aiConfidence)}
                  {email.hasUnsubscribeLink && (
                    <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 animate-bounce-in">
                      <LinkIcon className="h-3 w-3 mr-1" />
                      Unsubscribe Link Found
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="mb-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Subject:</h4>
                <p className="text-gray-700 dark:text-gray-300">{email.subject}</p>
              </div>
            </div>
            
            {/* Email Body */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 animate-fade-in">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                Email Content
              </h4>
              <div 
                className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert"
                dangerouslySetInnerHTML={renderEmailBody(email.body)}
              />
            </div>
            
            {/* Feedback Section */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg animate-slide-in">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Help Improve AI Classification</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Was this email correctly classified? Your feedback helps improve our AI.
              </p>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => feedbackMutation.mutate("spam")}
                  disabled={feedbackMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white transition-all duration-300 hover:scale-105"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  This is Spam
                </Button>
                <Button
                  onClick={() => feedbackMutation.mutate("not_spam")}
                  disabled={feedbackMutation.isPending}
                  className="bg-green-500 hover:bg-green-600 text-white transition-all duration-300 hover:scale-105"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  This is Not Spam
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 animate-shake">
            <div className="text-center">
              <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Email not found</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}