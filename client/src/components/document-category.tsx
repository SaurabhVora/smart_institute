import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Document } from "@shared/schema";
import { useDocumentsByCategory, useDocumentFeedback } from "@/hooks/use-documents";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { FileIcon, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

// Map document status to badge variant and icon
const statusConfig = {
  approved: { variant: "success", icon: CheckCircle, text: "Approved" },
  rejected: { variant: "destructive", icon: XCircle, text: "Rejected" },
  pending: { variant: "outline", icon: Clock, text: "Pending" },
};

type DocumentCategoryProps = {
  title: string;
  description: string;
  category: string;
};

export function DocumentCategory({ title, description, category }: DocumentCategoryProps) {
  const { data: documents, isLoading, error } = useDocumentsByCategory(category);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileIcon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading documents...</p>}
        
        {error && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">Failed to load documents</p>
          </div>
        )}
        
        {documents && documents.length === 0 && (
          <p className="text-sm text-muted-foreground">No documents found in this category</p>
        )}
        
        {documents && documents.length > 0 && (
          <div className="space-y-3">
            {documents.map((doc) => {
              const status = doc.status as keyof typeof statusConfig;
              const StatusIcon = statusConfig[status]?.icon || AlertCircle;
              
              return (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{doc.filePath.split('/').pop()}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusConfig[status]?.variant as any || "default"} className="flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      <span>{statusConfig[status]?.text || status}</span>
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedDocument(doc)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {selectedDocument && (
        <DocumentDetailsDialog 
          document={selectedDocument} 
          onClose={() => setSelectedDocument(null)} 
        />
      )}
    </Card>
  );
}

type DocumentDetailsDialogProps = {
  document: Document;
  onClose: () => void;
};

function DocumentDetailsDialog({ document, onClose }: DocumentDetailsDialogProps) {
  const { data: feedbackList, isLoading: loadingFeedback } = useDocumentFeedback(document.id);
  const status = document.status as keyof typeof statusConfig;
  const StatusIcon = statusConfig[status]?.icon || AlertCircle;

  return (
    <Dialog open={!!document} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Document Details</DialogTitle>
          <DialogDescription>
            View document information and feedback
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">File Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Filename:</span>
              <span>{document.filePath.split('/').pop()}</span>
              
              <span className="text-muted-foreground">Category:</span>
              <span className="capitalize">{document.type}</span>
              
              <span className="text-muted-foreground">Uploaded:</span>
              <span>{new Date(document.createdAt).toLocaleString()}</span>
              
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={statusConfig[status]?.variant as any || "default"} className="inline-flex items-center gap-1 w-fit">
                <StatusIcon className="h-3 w-3" />
                <span>{statusConfig[status]?.text || status}</span>
              </Badge>
              
              {document.companyName && (
                <>
                  <span className="text-muted-foreground">Company:</span>
                  <span>{document.companyName}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Feedback History</h4>
            {loadingFeedback && <p className="text-sm text-muted-foreground">Loading feedback...</p>}
            
            {feedbackList && feedbackList.length === 0 && (
              <p className="text-sm text-muted-foreground">No feedback available for this document</p>
            )}
            
            {feedbackList && feedbackList.length > 0 && (
              <div className="space-y-3">
                {feedbackList.map((feedback) => (
                  <div key={feedback.id} className="rounded-md border p-3 text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{feedback.faculty?.name || "Faculty"}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {feedback.rating && (
                        <Badge variant="outline" className="ml-auto">
                          Rating: {feedback.rating}/5
                        </Badge>
                      )}
                    </div>
                    <p>{feedback.feedback}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 