import { Card, CardContent } from "@/components/ui/card";
import { Mail, AlertTriangle, Link2Off, CheckCircle } from "lucide-react";

interface StatusCardsProps {
  scanData?: {
    scan: {
      totalScanned: number;
      detectedSpam: number;
      unsubscribeLinks: number;
      processed: number;
    };
  };
}

export default function StatusCards({ scanData }: StatusCardsProps) {
  const stats = scanData?.scan || {
    totalScanned: 0,
    detectedSpam: 0,
    unsubscribeLinks: 0,
    processed: 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Mail className="text-primary text-2xl mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Emails Scanned</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalScanned.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <AlertTriangle className="text-error text-2xl mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">AI Detected Spam</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.detectedSpam.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Link2Off className="text-warning text-2xl mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Unsubscribe Links</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.unsubscribeLinks.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <CheckCircle className="text-success text-2xl mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Successfully Processed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.processed.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
