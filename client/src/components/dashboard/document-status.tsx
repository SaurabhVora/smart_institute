import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Document, User } from "@shared/schema";
import { FileText, User as UserIcon, Eye } from "lucide-react";
import { format } from "date-fns";
import { StudentDetails } from "./student-details";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

type DocumentWithUser = Document & { user?: User };

export function DocumentStatus({ document }: { document: DocumentWithUser }) {
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${document.userId}`],
    enabled: !!document.userId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "approved" | "rejected" }) => {
      await apiRequest("PATCH", `/api/documents/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openDocument = () => {
    window.open(`/api/documents/${document.id}/view`, '_blank');
  };

  const PreviewDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <iframe 
          src={`/api/documents/${document.id}/view`}
          className="w-full h-[600px] border rounded"
          title="Document Preview"
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium capitalize flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {document.type.replace('_', ' ')}
          </h3>
          <p className="text-sm text-muted-foreground">
            Uploaded on {format(new Date(document.createdAt!), "PPP")}
          </p>
          {document.companyName && (
            <p className="text-sm text-muted-foreground">
              Company: {document.companyName}
            </p>
          )}
          {document.internshipDomain && (
            <p className="text-sm text-muted-foreground">
              Domain: {document.internshipDomain}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <PreviewDialog />
            <Button size="sm" variant="outline" onClick={openDocument}>
              Download
            </Button>
          </div>
          {document.status === "pending" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => updateStatusMutation.mutate({ id: document.id, status: "approved" })}
                disabled={updateStatusMutation.isPending}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateStatusMutation.mutate({ id: document.id, status: "rejected" })}
                disabled={updateStatusMutation.isPending}
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>

      {user && (
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">Student ID: {user.id}</p>
            </div>
          </div>
          <StudentDetails student={user} />
        </div>
      )}
    </Card>
  );
}