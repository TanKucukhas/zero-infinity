"use client";
import * as React from "react";
import Papa from "papaparse";
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip
} from "@mui/material";
import { 
  CloudUpload, 
  CheckCircle, 
  Error as ErrorIcon, 
  Delete,
  FileUpload
} from "@mui/icons-material";

interface UploadCSVProps {
  onStatusChange?: (status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error') => void;
  onStatsChange?: (stats: { total: number; processed: number; errors: number }) => void;
}

export default function UploadCSV({ onStatusChange, onStatsChange }: UploadCSVProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = React.useState(0);
  const [stats, setStats] = React.useState({ total: 0, processed: 0, errors: 0 });
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadStatus('idle');
      setErrorMessage('');
    } else {
      setErrorMessage('Please select a valid CSV file.');
      setUploadStatus('error');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setProgress(0);
    onStatusChange?.('uploading');

    try {
      const rows: any[] = [];
      let processedCount = 0;
      let errorCount = 0;

      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        step: (result) => {
          rows.push(result.data);
          processedCount++;
          setProgress((processedCount / 1000) * 100); // Estimate based on 1000 rows
        },
        complete: async () => {
          setUploadStatus('processing');
          onStatusChange?.('processing');
          
          setStats({ total: rows.length, processed: 0, errors: 0 });
          onStatsChange?.({ total: rows.length, processed: 0, errors: 0 });

          // Process in batches
          for (let i = 0; i < rows.length; i += 200) {
            const batch = rows.slice(i, i + 200);
            try {
              const response = await fetch("/api/import", {
                method: "POST",
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ batch })
              });

              if (!response.ok) {
                throw Error(`HTTP error! status: ${response.status}`);
              }

              processedCount += batch.length;
              setProgress((processedCount / rows.length) * 100);
              setStats({ total: rows.length, processed: processedCount, errors: errorCount });
              onStatsChange?.({ total: rows.length, processed: processedCount, errors: errorCount });
            } catch (error) {
              console.error('Batch processing error:', error);
              errorCount += batch.length;
            }
          }

          setUploadStatus('completed');
          onStatusChange?.('completed');
          setStats({ total: rows.length, processed: processedCount, errors: errorCount });
          onStatsChange?.({ total: rows.length, processed: processedCount, errors: errorCount });
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          setErrorMessage('Error parsing CSV file. Please check the format.');
          setUploadStatus('error');
          onStatusChange?.('error');
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage('Upload failed. Please try again.');
      setUploadStatus('error');
      onStatusChange?.('error');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setProgress(0);
    setStats({ total: 0, processed: 0, errors: 0 });
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadStatus('idle');
      setErrorMessage('');
    } else {
      setErrorMessage('Please drop a valid CSV file.');
      setUploadStatus('error');
    }
  };

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: selectedFile ? 'primary.main' : 'grey.300',
          backgroundColor: selectedFile ? 'primary.light' : 'grey.50',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'primary.light',
          }
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {selectedFile ? (
          <Box>
            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {selectedFile.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {(selectedFile.size / 1024).toFixed(1)} KB
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<FileUpload />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
              >
                Upload
              </Button>
              <Tooltip title="Remove file">
                <IconButton onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}>
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ) : (
          <Box>
            <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Drop CSV file here or click to browse
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported format: CSV files only
            </Typography>
          </Box>
        )}
      </Paper>

      {uploadStatus === 'uploading' && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Uploading file...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {uploadStatus === 'processing' && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Processing {stats.processed} of {stats.total} records
          </Typography>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}

      {uploadStatus === 'completed' && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Import completed successfully! Processed {stats.processed} records.
            {stats.errors > 0 && ` ${stats.errors} errors occurred.`}
          </Typography>
        </Alert>
      )}

      {uploadStatus === 'error' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            {errorMessage || 'Import failed. Please check your file format and try again.'}
          </Typography>
        </Alert>
      )}

      {stats.total > 0 && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Chip label={`Total: ${stats.total}`} size="small" />
          <Chip label={`Processed: ${stats.processed}`} size="small" color="success" />
          {stats.errors > 0 && (
            <Chip label={`Errors: ${stats.errors}`} size="small" color="error" />
          )}
        </Box>
      )}
    </Box>
  );
}


