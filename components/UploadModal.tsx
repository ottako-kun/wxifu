import React, { useState, useCallback, useRef } from 'react';
import CloseIcon from './icons/CloseIcon';
import UploadIcon from './icons/UploadIcon';
import PhotoIcon from './icons/PhotoIcon';
import VideoIcon from './icons/VideoIcon';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (files: File[]) => void;
  onImportUrl: (url: string) => void;
}

const FilePreview: React.FC<{ file: File }> = ({ file }) => {
  const isImage = file.type.startsWith('image/');
  return (
    <div className="flex items-center space-x-3 bg-gray-700/50 p-2 rounded-lg">
      {isImage ? <PhotoIcon className="w-6 h-6 text-cyan-400" /> : <VideoIcon className="w-6 h-6 text-pink-400" />}
      <span className="text-sm text-gray-300 truncate flex-1">{file.name}</span>
      <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
    </div>
  );
};

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload, onImportUrl }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [url, setUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
      setUrl(''); // Clear URL if files are selected
    }
  };
  
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>, inZone: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if(inZone) setIsDragging(true);
    else setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
      setUrl(''); // Clear URL if files are dropped
      e.dataTransfer.clearData();
    }
  }, []);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handlePrimaryAction = () => {
    if (files.length > 0) {
      onUpload(files);
    } else if (url.trim()) {
      onImportUrl(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg mx-auto flex flex-col relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ textShadow: '0 0 5px #000' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Upload Media</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 flex-grow overflow-y-auto max-h-[70vh]">
          <div
            onClick={triggerFileSelect}
            onDragEnter={(e) => handleDrag(e, true)}
            onDragLeave={(e) => handleDrag(e, false)}
            onDragOver={(e) => handleDrag(e, true)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-pink-500 bg-pink-500/10' : 'border-gray-600 hover:border-cyan-500 hover:bg-cyan-500/10'}`}
          >
            <UploadIcon className="w-12 h-12 text-gray-500 mb-3" />
            <p className="text-gray-400 text-center">
              <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">Photos or Videos</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          
          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Selected Files:</h3>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                {files.map((file) => <FilePreview key={`${file.name}-${file.lastModified}`} file={file} />)}
              </div>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-900 px-3 text-sm text-gray-500">Or</span>
            </div>
          </div>
            
          <div>
            <label htmlFor="url-input" className="text-sm font-medium text-gray-400 mb-2 block">
              Import from Google Drive
            </label>
            <input
              id="url-input"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (files.length > 0) setFiles([]); // Clear files if user types a URL
              }}
              placeholder="Paste a public share link here"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-shadow"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end">
          <button
            onClick={handlePrimaryAction}
            disabled={files.length === 0 && url.trim().length === 0}
            className="px-6 py-2 bg-pink-600 text-white font-semibold rounded-lg shadow-md hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform disabled:transform-none hover:scale-105"
          >
            Add to Gallery
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;