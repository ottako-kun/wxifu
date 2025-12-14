import React from 'react';
import UploadIcon from './icons/UploadIcon';
import LoadingSpinner from './icons/LoadingSpinner';

interface UploadButtonProps {
  onClick: () => void;
  isUploading: boolean;
}

const UploadButton: React.FC<UploadButtonProps> = ({ onClick, isUploading }) => {
  return (
    <button
      onClick={onClick}
      disabled={isUploading}
      className="hidden md:flex fixed bottom-6 right-6 md:bottom-8 md:right-8 z-30 items-center justify-center w-16 h-16 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-pink-400 focus:ring-opacity-50 disabled:bg-pink-800 disabled:cursor-wait"
      aria-label={isUploading ? "Uploading media" : "Upload media"}
    >
      {isUploading ? <LoadingSpinner className="w-8 h-8" /> : <UploadIcon className="w-8 h-8" />}
    </button>
  );
};

export default UploadButton;