import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Eye, RotateCcw, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface EmailReviewTableProps {
  scanData: {
    scan: any;
    emails: Array<{
      id: number;
      sender: string;
      subject: string;
      aiConfidence: number;
      hasUnsubscribeLink: boolean;
      isSelected: boolean;
      receivedDate: string;
    }>;
  };
  onPreviewEmail: (emailId: number) => void;
  onRefresh: () => void;
}

export default function EmailReviewTable({ scanData, onPreviewEmail, onRefresh }: EmailReviewTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const itemsPerPage = 10;
  
  const queryClient = useQueryClient();
  const emails = scanData.emails || [];
  
  const totalPages = Math.ceil(emails.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEmails = emails.slice(startIndex, startIndex + itemsPerPage);
  const selectedCount = emails.filter(email => email.isSelected).length;

  const updateEmailMutation = useMutation({
    mutationFn: async ({ emailId, updates }: { emailId: number; updates: any }) => {
      return apiRequest("PATCH", `/api/email/${emailId}`, updates);
    },
    onSuccess: () => {
      onRefresh();
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ emailIds, updates }: { emailIds: number[]; updates: any }) => {
      return apiRequest("PATCH", "/api/emails/bulk", { emailIds, updates });
    },
    onSuccess: () => {
      onRefresh();
    },
  });

  const handleSelectEmail = (emailId: number, isSelected: boolean) => {
    updateEmailMutation.mutate({ emailId, updates: { isSelected } });
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const emailIds = emails.map(email => email.id);
    bulkUpdateMutation.mutate({ 
      emailIds, 
      updates: { isSelected: newSelectAll } 
    });
  };

  const handleDeselectAll = () => {
    setSelectAll(false);
    const emailIds = emails.map(email => email.id);
    bulkUpdateMutation.mutate({ 
      emailIds, 
      updates: { isSelected: false } 
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-red-500";
    if (confidence >= 60) return "bg-orange-500";
    return "bg-yellow-500";
  };

  const getConfidenceTextColor = (confidence: number) => {
    if (confidence >= 80) return "text-red-700";
    if (confidence >= 60) return "text-orange-700";
    return "text-yellow-700";
  };

  if (!emails.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Emails Found</h3>
        <p className="text-gray-600">Run a spam folder scan to see AI classification results.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">AI Spam Classification Results</h3>
          <p className="text-sm text-gray-600 mt-1">Review emails classified as spam by AI - uncheck any you want to keep</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="text-primary hover:text-blue-700"
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeselectAll}
            className="text-gray-600 hover:text-gray-800"
          >
            Deselect All
          </Button>
          <Button
            className="btn-error flex items-center"
            disabled={selectedCount === 0}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Process Selected ({selectedCount})
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <Checkbox 
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Confidence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unsubscribe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentEmails.map((email) => (
              <tr key={email.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Checkbox 
                    checked={email.isSelected}
                    onCheckedChange={(checked) => handleSelectEmail(email.id, !!checked)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {email.sender.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 max-w-48 truncate">
                        {email.sender}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(email.receivedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {email.subject}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`text-sm font-medium ${getConfidenceTextColor(email.aiConfidence)}`}>
                      {email.aiConfidence}%
                    </div>
                    <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${getConfidenceColor(email.aiConfidence)} h-2 rounded-full`}
                        style={{ width: `${email.aiConfidence}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {email.hasUnsubscribeLink ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Found
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Not Found
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPreviewEmail(email.id)}
                    className="text-primary hover:text-blue-700 mr-3"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectEmail(email.id, false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(startIndex + itemsPerPage, emails.length)}</span> of{' '}
              <span className="font-medium">{emails.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "btn-primary" : ""}
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
