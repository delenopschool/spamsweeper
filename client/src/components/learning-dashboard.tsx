import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";

interface LearningDashboardProps {
  userId: number;
}

const LearningDashboard = React.memo(function LearningDashboard({ userId }: LearningDashboardProps) {
  const { t } = useLanguage();
  const { data: learningData, isLoading } = useQuery({
    queryKey: ["/api/user", userId, "learning"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/user/${userId}/learning`);
      return response.json();
    },
    enabled: !!userId,
    staleTime: 120000, // Cache learning data for 2 minutes
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  const patterns = learningData?.learningData || [];
  const spamPatterns = patterns.filter((p: any) => p.userDecision === "spam");
  const notSpamPatterns = patterns.filter((p: any) => p.userDecision === "not_spam");

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground">{t.learning.title}</CardTitle>
        </div>
        <CardDescription>
          {t.learning.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Spam Patterns */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <h4 className="font-medium text-foreground">{t.learning.spamPatterns} ({spamPatterns.length})</h4>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {spamPatterns.length > 0 ? (
                spamPatterns.map((pattern: any) => (
                  <div key={pattern.id} className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900 dark:text-red-100 truncate">
                          {pattern.senderPattern}
                        </p>
                        {pattern.subjectPattern && (
                          <p className="text-xs text-red-700 dark:text-red-300 mt-1 truncate">
                            "{pattern.subjectPattern}"
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2 text-xs border-red-300 text-red-700 dark:border-red-700 dark:text-red-300">
                        {pattern.confidence}%
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t.learning.noSpamPatterns}</p>
              )}
            </div>
          </div>

          {/* Not Spam Patterns */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <h4 className="font-medium text-foreground">{t.learning.legitimatePatterns} ({notSpamPatterns.length})</h4>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {notSpamPatterns.length > 0 ? (
                notSpamPatterns.map((pattern: any) => (
                  <div key={pattern.id} className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100 truncate">
                          {pattern.senderPattern}
                        </p>
                        {pattern.subjectPattern && (
                          <p className="text-xs text-green-700 dark:text-green-300 mt-1 truncate">
                            "{pattern.subjectPattern}"
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2 text-xs border-green-300 text-green-700 dark:border-green-700 dark:text-green-300">
                        {pattern.confidence}%
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t.learning.noLegitimatePatterns}</p>
              )}
            </div>
          </div>
        </div>

        {/* Learning Stats */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {t.learning.totalPatternsLearned.replace('{count}', patterns.length.toString())}
              </span>
            </div>
            {patterns.length > 0 && (
              <div className="text-xs text-muted-foreground">
                {t.learning.lastUpdated}: {new Date(patterns[0]?.updatedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default LearningDashboard;