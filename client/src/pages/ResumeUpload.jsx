import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ErrorMessage } from '../components/ui/ErrorMessage';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB

export const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const validateAndSetFile = (selectedFile) => {
    setError(null);

    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setError('Only PDF resumes are supported. Please select a valid .pdf file.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size exceeds the 4 MB limit. Please select a smaller PDF.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a PDF file to analyze.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      await api.upload('/resumes/upload', formData);
      navigate('/analysis');
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload and analyze your resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Upload Resume"
        description="Upload your PDF resume for instant Google Gemini AI analysis and scoring."
      />

      {error && <ErrorMessage message={error} className="mb-4" />}

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleChange}
            className="hidden"
            id="resume-file-input"
          />

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
              dragActive
                ? 'border-indigo-600 bg-indigo-50/60'
                : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="font-semibold text-slate-800 text-base">
              Click to select or drag and drop your PDF resume
            </h3>
            <p className="text-xs text-slate-400 mt-1">PDF documents only, maximum 4 MB</p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-xs">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              Browse Files
            </div>
          </div>

          {/* Selected File Card */}
          {file && (
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100/70 text-indigo-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 truncate max-w-sm">{file.name}</p>
                  <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-xs text-slate-400 hover:text-rose-500 ml-2"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {/* AI Analysis Disclaimer */}
          <div className="rounded-xl bg-indigo-50/50 border border-indigo-100/70 p-4 text-xs text-indigo-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">AI Security & Privacy:</span> Your resume is parsed securely using Gemini 2.5. Text extraction occurs in isolated memory before storage, ensuring clean processing.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!file}
              loading={uploading}
              icon={Sparkles}
              className="w-full sm:w-auto"
            >
              {uploading ? 'Extracting & Analyzing with Gemini...' : 'Analyze Resume'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
