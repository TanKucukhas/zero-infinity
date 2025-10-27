"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<"idle" | "processing" | "success" | "error">("idle");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = () => {
    if (!file) return;
    
    setImportStatus("processing");
    
    // Simulate import process
    setTimeout(() => {
      setImportStatus("success");
    }, 2000);
  };

  const downloadTemplate = () => {
    // Create a simple CSV template
    const csvContent = "Name,Email,Company,Role\nJohn Doe,john@example.com,Acme Corp,CEO\nJane Smith,jane@example.com,Tech Inc,CTO";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "people_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Import Data</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Upload CSV files to import people data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-6 text-center">
              <FileText className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Drag and drop your CSV file here, or click to browse
              </p>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="max-w-xs mx-auto"
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <FileText className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                <span className="text-sm text-zinc-900 dark:text-zinc-100">{file.name}</span>
                <Badge variant="info">{(file.size / 1024).toFixed(1)} KB</Badge>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleImport} 
                disabled={!file || importStatus === "processing"}
                className="flex-1"
              >
                {importStatus === "processing" ? "Processing..." : "Import Data"}
              </Button>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
            </div>

            {importStatus === "success" && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  Import completed successfully!
                </span>
              </div>
            )}

            {importStatus === "error" && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-600 dark:text-red-400">
                  Import failed. Please check your file format.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Import Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">CSV Format Requirements:</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li>• First row must contain column headers</li>
                <li>• Required columns: Name, Email, Company, Role</li>
                <li>• File size limit: 10MB</li>
                <li>• Maximum 10,000 rows per file</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Supported Columns:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded">
                  <span className="font-medium">Name</span>
                  <p className="text-zinc-500">Full name</p>
                </div>
                <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded">
                  <span className="font-medium">Email</span>
                  <p className="text-zinc-500">Email address</p>
                </div>
                <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded">
                  <span className="font-medium">Company</span>
                  <p className="text-zinc-500">Company name</p>
                </div>
                <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded">
                  <span className="font-medium">Role</span>
                  <p className="text-zinc-500">Job title</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}