import { useState, useMemo, useCallback, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Eye, RotateCcw, Trash2, ChevronLeft, ChevronRight, Search, ThumbsUp, ThumbsDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import confetti from 'canvas-confetti';

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
      userFeedback?: string;
      aiStatus?: string;
    }>;
  };
  onPreviewEmail: (emailId: number) => void;
  onRefresh: () => void;
}

export default function EmailReviewTable({ scanData, onPreviewEmail, onRefresh }: EmailReviewTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const itemsPerPage = 10;
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Debounce search query for better performance
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // User feedback mutation
  const userFeedbackMutation = useMutation({
    mutationFn: async ({ emailId, feedback }: { emailId: number; feedback: "spam" | "not_spam" }) => {
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
        title: "Feedback opgeslagen",
        description: "Het systeem heeft jouw feedback ontvangen en leert hiervan!",
      });
      onRefresh();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Er ging iets mis bij het opslaan van je feedback.",
        variant: "destructive",
      });
    },
  });

  // Process selected emails mutation
  const processSelectedMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/emails/process", {
        method: "POST",
        body: JSON.stringify({ scanId: scanData.scan.id }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
      });
      
      // Add a second burst after a short delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#3b82f6']
        });
      }, 200);
      
      toast({
        title: "🎉 Emails processed",
        description: `Successfully processed ${data.processed} emails with unsubscribe links.`,
      });
      onRefresh();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process selected emails.",
        variant: "destructive",
      });
    },
  });


  
  // Use debounced search query for better performance
  const { data: searchResults } = useQuery({
    queryKey: ["/api/scan", scanData.scan.id, "search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return null;
      const response = await fetch(`/api/scan/${scanData.scan.id}/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!scanData.scan.id && !!debouncedQuery.trim(),
    staleTime: 30000, // Cache results for 30 seconds
  });
  
  // Memoize expensive calculations
  const emails = useMemo(() => {
    return searchResults?.emails || scanData.emails || [];
  }, [searchResults?.emails, scanData.emails]);
  
  const { totalPages, startIndex, currentEmails, selectedCount } = useMemo(() => {
    const totalPages = Math.ceil(emails.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentEmails = emails.slice(startIndex, startIndex + itemsPerPage);
    const selectedCount = emails.filter((email: any) => email.isSelected).length;
    
    return { totalPages, startIndex, currentEmails, selectedCount };
  }, [emails, currentPage, itemsPerPage]);

  const updateEmailMutation = useMutation({
    mutationFn: async ({ emailId, updates }: { emailId: number; updates: any }) => {
      const response = await fetch(`/api/email/${emailId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      onRefresh();
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ emailIds, updates }: { emailIds: number[]; updates: any }) => {
      const response = await fetch("/api/emails/bulk", {
        method: "PATCH",
        body: JSON.stringify({ emailIds, updates }),
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      onRefresh();
    },
  });

  // Memoize callback functions to prevent unnecessary re-renders
  const handleSelectEmail = useCallback((emailId: number, isSelected: boolean) => {
    updateEmailMutation.mutate({ emailId, updates: { isSelected } });
  }, [updateEmailMutation]);

  const handleUserFeedbackMemo = useCallback((emailId: number, feedback: "spam" | "not_spam") => {
    userFeedbackMutation.mutate({ emailId, feedback });
  }, [userFeedbackMutation]);

  const handleSelectAll = useCallback(() => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const emailIds = emails.map(email => email.id);
    bulkUpdateMutation.mutate({ 
      emailIds, 
      updates: { isSelected: newSelectAll } 
    });
  }, [selectAll, emails, bulkUpdateMutation]);

  const handleDeselectAll = useCallback(() => {
    setSelectAll(false);
    const emailIds = emails.map(email => email.id);
    bulkUpdateMutation.mutate({ 
      emailIds, 
      updates: { isSelected: false } 
    });
  }, [emails, bulkUpdateMutation]);

  // Memoize color calculation functions
  const getConfidenceColor = useCallback((confidence: number) => {
    if (confidence >= 80) return "bg-red-500";
    if (confidence >= 60) return "bg-orange-500";
    return "bg-yellow-500";
  }, []);

  const getConfidenceTextColor = useCallback((confidence: number) => {
    if (confidence >= 80) return "text-red-700";
    if (confidence >= 60) return "text-orange-700";
    return "text-yellow-700";
  }, []);

  if (!emails.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center animate-fade-in">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Emails Found</h3>
        <p className="text-gray-600 dark:text-gray-400">Run a spam folder scan to see AI classification results.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">AI Spam Classification Results</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Review emails classified as spam by AI - uncheck any you want to keep</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors animate-fade-in"
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeselectAll}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors animate-fade-in"
            >
              Deselect All
            </Button>
            <Button
              className={`btn-error flex items-center transition-all duration-300 ${
                selectedCount === 0 || processSelectedMutation.isPending 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:scale-105 animate-glow'
              }`}
              disabled={selectedCount === 0 || processSelectedMutation.isPending}
              onClick={() => processSelectedMutation.mutate()}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              {processSelectedMutation.isPending ? "Processing..." : `Process Selected (${selectedCount})`}
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative animate-slide-in">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500 transition-colors" />
          <Input
            placeholder="Search emails by sender, subject, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>
      </div>

      
      <div className="overflow-x-auto animate-fade-in">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <Checkbox 
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                  className="transition-all duration-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">AI Confidence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unsubscribe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Feedback</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentEmails.map((email, index) => (
              <tr key={email.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Checkbox 
                    checked={email.isSelected}
                    onCheckedChange={(checked) => handleSelectEmail(email.id, !!checked)}
                    className="transition-all duration-300 hover:scale-110"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center transition-all duration-300 hover:scale-110">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {email.sender.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 max-w-48 truncate">
                        {email.sender}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(email.receivedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                    {email.subject}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {email.aiStatus === "error" ? (
                    <Badge className="bg-red-600 text-white transition-all duration-300 hover:scale-105">
                      AI Error
                    </Badge>
                  ) : (
                    <div className="flex items-center">
                      <div className={`text-sm font-medium ${getConfidenceTextColor(email.aiConfidence)} transition-colors`}>
                        {email.aiConfidence}%
                      </div>
                      <div className="ml-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`${getConfidenceColor(email.aiConfidence)} h-2 rounded-full transition-all duration-500 animate-scale-in`}
                          style={{ width: `${email.aiConfidence}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {email.hasUnsubscribeLink ? (
                    <Badge variant="default" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 animate-bounce-in">
                      Found
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      Not Found
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPreviewEmail(email.id)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 hover:scale-110"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUserFeedbackMemo(email.id, "spam")}
                      className={`transition-all duration-300 hover:scale-110 ${
                        email.userFeedback === "spam" 
                          ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" 
                          : "text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      }`}
                      title="Mark as spam (helps AI learn)"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUserFeedbackMemo(email.id, "not_spam")}
                      className={`transition-all duration-300 hover:scale-110 ${
                        email.userFeedback === "not_spam" 
                          ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20" 
                          : "text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                      }`}
                      title="Mark as not spam (helps AI learn)"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                  </div>
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
