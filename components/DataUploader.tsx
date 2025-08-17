import React, { useState, useCallback } from 'react';
import { Icons } from './Icons';

interface DataUploaderProps {
  onFileLoaded: (file: File) => Promise<void>;
  onClose: () => void;
  uploadProgress: number;
  isClosable?: boolean;
}

const DataUploader: React.FC<DataUploaderProps> = ({ onFileLoaded, onClose, uploadProgress, isClosable = true }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  }, []);


  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    setIsParsing(true);
    setError(null);
    try {
      await onFileLoaded(file);
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-brand-surface rounded-lg w-full max-w-lg border border-brand-border shadow-2xl relative">
        {isClosable && <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-secondary hover:text-white text-2xl font-bold">&times;</button>}
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Load Market Data</h2>
          <p className="text-brand-text-secondary mb-1">Upload your corporate bond data in CSV format to begin.</p>
          <p className="text-xs text-brand-text-secondary mb-6">Tip: In Excel, use "File &gt; Save As" and choose "CSV (Comma delimited)".</p>

          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`p-8 border-2 border-dashed rounded-lg transition-colors ${dragOver ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-border'}`}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isParsing}
            />
            <label htmlFor="file-upload" className={isParsing ? 'cursor-not-allowed' : 'cursor-pointer'}>
              <Icons.database className="h-12 w-12 mx-auto text-brand-text-secondary mb-2" />
              <p className="font-semibold text-brand-text">
                {file ? file.name : 'Drag & drop your file here'}
              </p>
              <p className="text-sm text-brand-text-secondary">or click to browse</p>
            </label>
          </div>
          
          {isParsing && (
            <div className="mt-4">
              <p className="text-sm text-brand-primary">Parsing file... {Math.round(uploadProgress)}%</p>
              <div className="w-full bg-brand-bg rounded-full h-2.5 mt-2 border border-brand-border">
                <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%`, transition: 'width 0.1s linear' }}></div>
              </div>
            </div>
          )}

          {error && <p className="text-brand-red mt-4">{error}</p>}
          
          <button
            onClick={handleUpload}
            disabled={!file || isParsing}
            className="w-full mt-6 bg-brand-primary text-black font-semibold py-3 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isParsing ? 'Processing...' : 'Load Data & Start'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataUploader;