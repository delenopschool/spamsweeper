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
      return apiRequest(`/api/email/${emailId}/feedback`, {
        method: "POST",
        body: JSON.stringify({ feedback }),
        headers: { "Content-Type": "application/json" }
      });
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
      return <Badge className="bg-red-100 text-red-800">{confidence}% Spam Confidence</Badge>;
    } else if (confidence >= 60) {
      return <Badge className="bg-orange-100 text-orange-800">{confidence}% Spam Confidence</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">{confidence}% Spam Confidence</Badge>;
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            Email Preview
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Review the email content and provide feedback to help improve our AI spam detection.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : email ? (
          <div className="space-y-4">
            {/* Email Headers */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">From:</span>
                  <span className="text-gray-600">{email.sender}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getConfidenceBadge(email.aiConfidence)}
                  {email.hasUnsubscribeLink && (
                    <Badge className="bg-green-100 text-green-800">
                      <LinkIcon className="h-3 w-3 mr-1" />
                      Unsubscribe Found
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="mb-2">
                <span className="font-medium text-gray-900">Subject:</span>
                <span className="ml-2 text-gray-600">{email.subject}</span>
              </div>
              
              <div className="mb-4">
                <span className="font-medium text-gray-900">Date:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(email.receivedDate).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Email Body */}
            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <div 
                className="text-sm text-gray-800 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={renderEmailBody(email.body)}
              />
            </div>

            {/* Feedback Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Is this spam?</span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => feedbackMutation.mutate("not_spam")}
                    disabled={feedbackMutation.isPending}
                    className="flex items-center space-x-1"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>Not Spam</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => feedbackMutation.mutate("spam")}
                    disabled={feedbackMutation.isPending}
                    className="flex items-center space-x-1"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>Is Spam</span>
                  </Button>
                </div>
              </div>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Email not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
