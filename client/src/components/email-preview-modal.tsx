import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Shield, Link as LinkIcon } from "lucide-react";

interface EmailPreviewModalProps {
  emailId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailPreviewModal({ emailId, isOpen, onClose }: EmailPreviewModalProps) {
  const { data: email, isLoading } = useQuery({
    queryKey: ["/api/email", emailId],
    enabled: !!emailId && isOpen,
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

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  // Handle mark as not spam
                  onClose();
                }}
              >
                Not Spam
              </Button>
              <Button
                className="btn-error"
                onClick={() => {
                  // Handle confirm spam
                  onClose();
                }}
              >
                Confirm Spam
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
