import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Folder, Mail, AlertCircle } from "lucide-react";

interface FolderSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedFolders: string[]) => void;
  provider: string;
  isLoading?: boolean;
}

const FOLDER_OPTIONS = {
  gmail: [
    { id: "SPAM", name: "Spam", description: "Emails marked as spam by Gmail", icon: "⚠️" },
    { id: "TRASH", name: "Trash", description: "Deleted emails", icon: "🗑️" },
    { id: "PROMOTIONS", name: "Promotions", description: "Marketing and promotional emails", icon: "📢" },
    { id: "SOCIAL", name: "Social", description: "Social media notifications", icon: "👥" },
    { id: "UPDATES", name: "Updates", description: "App and service updates", icon: "📱" },
    { id: "FORUMS", name: "Forums", description: "Forum notifications and discussions", icon: "💬" }
  ],
  outlook: [
    { id: "JunkEmail", name: "Junk Email", description: "Emails marked as junk by Outlook", icon: "⚠️" },
    { id: "DeletedItems", name: "Deleted Items", description: "Deleted emails", icon: "🗑️" },
    { id: "Clutter", name: "Clutter", description: "Low-priority emails", icon: "📋" },
    { id: "Archive", name: "Archive", description: "Archived emails", icon: "📁" }
  ]
};

export default function FolderSelectionModal({ isOpen, onClose, onConfirm, provider, isLoading = false }: FolderSelectionModalProps) {
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  
  const availableFolders = FOLDER_OPTIONS[provider as keyof typeof FOLDER_OPTIONS] || FOLDER_OPTIONS.gmail;

  const handleFolderToggle = (folderId: string) => {
    setSelectedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleConfirm = () => {
    if (selectedFolders.length === 0) {
      return;
    }
    onConfirm(selectedFolders);
    setSelectedFolders([]);
  };

  const handleClose = () => {
    setSelectedFolders([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="folder-selection-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            Selecteer folders om te scannen
          </DialogTitle>
          <DialogDescription id="folder-selection-description">
            Kies welke email folders je wilt scannen op spam emails. Je kunt meerdere folders selecteren.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {availableFolders.map((folder) => (
            <div key={folder.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Checkbox 
                id={folder.id}
                checked={selectedFolders.includes(folder.id)}
                onCheckedChange={() => handleFolderToggle(folder.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{folder.icon}</span>
                  <label htmlFor={folder.id} className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                    {folder.name}
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {folder.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {selectedFolders.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Geselecteerde folders:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedFolders.map((folderId) => {
                const folder = availableFolders.find(f => f.id === folderId);
                return (
                  <Badge key={folderId} variant="secondary" className="text-xs">
                    {folder?.icon} {folder?.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            Houd er rekening mee dat het scannen van veel folders even kan duren. De AI analyseert elke email individueel.
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Annuleren
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={selectedFolders.length === 0 || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Scannen...
              </>
            ) : (
              `Scan ${selectedFolders.length} folder${selectedFolders.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}