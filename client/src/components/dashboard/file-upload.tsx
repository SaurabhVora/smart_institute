import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Upload, Building, Code } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function FileUpload() {
  const { toast } = useToast();
  const [type, setType] = useState<string>();
  const [file, setFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [internshipDomain, setInternshipDomain] = useState("");

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !type) {
        throw new Error("Please select both a file and document type");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      formData.append("status", "draft");

      if (type === "offer_letter") {
        if (!companyName || !internshipDomain) {
          throw new Error("Please fill in company name and internship domain");
        }
        formData.append("companyName", companyName);
        formData.append("internshipDomain", internshipDomain);
      }

      const res = await apiRequest("POST", "/api/documents", formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "File Uploaded",
        description: "Your file has been uploaded successfully.",
        variant: "success"
      });
      setFile(null);
      setType(undefined);
      setCompanyName("");
      setInternshipDomain("");
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Error",
          description: "File size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      const fileType = selectedFile.name.toLowerCase().split('.').pop();
      if (!['pdf', 'doc', 'docx'].includes(fileType || '')) {
        toast({
          title: "Error",
          description: "Only PDF and Word documents are allowed",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-[#1A2942] to-[#0F1A2D] border-gray-800 shadow-xl">
      <CardContent className="p-6">
        <div className="space-y-5">
          <div>
            <Label className="text-gray-300 mb-1.5 block">Document Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-[#1E293B] border-gray-700 text-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1E293B] border-gray-700 text-white">
                <SelectItem value="offer_letter">Offer Letter</SelectItem>
                <SelectItem value="monthly_report">Monthly Report</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "offer_letter" && (
            <div className="space-y-5">
              <div>
                <Label className="text-gray-300 mb-1.5 flex items-center">
                  <Building className="h-4 w-4 mr-1.5 text-blue-400" />
                  Company Name
                </Label>
                <Input 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                  className="bg-[#1E293B] border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300 mb-1.5 flex items-center">
                  <Code className="h-4 w-4 mr-1.5 text-blue-400" />
                  Internship Domain
                </Label>
                <Input 
                  value={internshipDomain}
                  onChange={(e) => setInternshipDomain(e.target.value)}
                  placeholder="e.g., Web Development, Data Science"
                  className="bg-[#1E293B] border-gray-700 text-white"
                />
              </div>
            </div>
          )}

          <div>
            <Label className="text-gray-300 mb-1.5 block">Upload File</Label>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center bg-[#1E293B]/50 hover:bg-[#1E293B] transition-colors">
              <Input 
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 mb-2 text-blue-400" />
                <span className="text-sm text-gray-300">
                  {file ? file.name : "Click to select a file or drag and drop"}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PDF or Word documents (max 5MB)
                </span>
              </Label>
            </div>
          </div>

          <Button 
            onClick={() => uploadMutation.mutate()}
            disabled={uploadMutation.isPending || !file || !type || (type === "offer_letter" && (!companyName || !internshipDomain))}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}