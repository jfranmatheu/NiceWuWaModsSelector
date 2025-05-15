'use client';

import { useState, useEffect } from 'react';
import ImageDisplay from './ImageDisplay';
import { IoClose } from 'react-icons/io5';
import { FaHeart, FaEye, FaCalendarAlt, FaClock, FaDownload, FaInfoCircle, FaFileAlt } from 'react-icons/fa';
import { IoOpenOutline } from 'react-icons/io5';
import useModStore from '@/store/modStore';

export default function GameBananaModModal({ mod, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [modDetails, setModDetails] = useState(null);
  const [detailsContext, setDetailsContext] = useState('info'); // 'info' or 'files'
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [installState, setInstallState] = useState(null); // null, 'installing', 'success', 'error'
  const [installMessage, setInstallMessage] = useState('');
  const { installFromGamebanana } = useModStore();

  useEffect(() => {
    const fetchModDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const response = await fetch(`https://gamebanana.com/apiv11/Mod/${mod._idRow}/ProfilePage`);
        const data = await response.json();
        setModDetails(data);
      } catch (error) {
        console.error('Error fetching mod details:', error);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    setInstallState(null);
    setInstallMessage('');
    fetchModDetails();
  }, [mod._idRow]);

  const handleCloseFeedback = () => {
    setInstallState(null);
    setInstallMessage('');
  };

  const handleOpenMod = () => {
    window.open(mod._sProfileUrl, '_blank');
  };

  const handleOpenAuthor = () => {
    window.open(mod._aSubmitter._sProfileUrl, '_blank');
  };

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
  };

  const handleMainImageClick = () => {
    setIsImagePreviewOpen(true);
  };

  const handleInstallFile = async (fileId) => {
    if (!modDetails) return;
    
    setInstallState('installing');
    setInstallMessage('Downloading and installing mod... This may take a few minutes.');
    
    try {
      await installFromGamebanana({
        modData: modDetails,
        selectedFiles: [Number(fileId)]
      });
      setInstallState('success');
      setInstallMessage('Mod installed successfully! You can now close this window.');
    } catch (error) {
      console.error('Installation error:', error);
      setInstallState('error');
      setInstallMessage(error.message || 'Failed to install mod. Please try again.');
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatFileSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  const images = mod._aPreviewMedia._aImages;
  const currentImage = images[currentImageIndex];
  const imageUrl = `${currentImage._sBaseUrl}/${currentImage._sFile}`;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
      >
        <IoClose className="w-6 h-6" />
      </button>

      {/* Installation Feedback Overlay */}
      {installState && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex flex-col items-center text-center">
              {installState === 'installing' && (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              )}
              {installState === 'success' && (
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
              {installState === 'error' && (
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              )}
              <p className="text-lg font-medium mb-2">
                {installState === 'installing' && 'Installing Mod...'}
                {installState === 'success' && 'Installation Complete!'}
                {installState === 'error' && 'Installation Failed'}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{installMessage}</p>
              {(installState === 'success' || installState === 'error') && (
                <button
                  onClick={handleCloseFeedback}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Content */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Column - Images */}
          <div className="w-3/5 flex flex-col">
            {/* Main Image */}
            <div className="relative aspect-video">
              <ImageDisplay
                filePath={imageUrl}
                alt={currentImage._sCaption || 'Mod Image'}
                fill
                className="object-contain cursor-pointer aspect-video"
                onClick={handleMainImageClick}
                deferredEffect={true}
              />
              {/* Title Overlay */}
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                <h2 className="text-xl font-semibold text-white">{mod._sName}</h2>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="p-3 flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative w-16 h-16 flex-shrink-0 cursor-pointer"
                  onClick={() => handleImageClick(index)}
                >
                  <ImageDisplay
                    filePath={`${image._sBaseUrl}/${image._sFile}`}
                    alt={image._sCaption || 'Mod Image'}
                    fill
                    className={`object-cover rounded ${
                      currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                    deferredEffect={true}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="w-2/5 border-l border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Fixed Header Section */}
            <div className="flex-none">
              {/* Author and Stats */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      <ImageDisplay
                        filePath={mod._aSubmitter._sAvatarUrl}
                        alt={mod._aSubmitter._sName}
                        fill
                        className="object-cover"
                        deferredEffect={true}
                      />
                    </div>
                    <button
                      onClick={handleOpenAuthor}
                      className="text-sm font-medium hover:text-blue-500 dark:hover:text-blue-400"
                    >
                      {mod._aSubmitter._sName}
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <FaHeart className="w-4 h-4 text-red-500" />
                      <span className="text-sm">{mod._nLikeCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaEye className="w-4 h-4" />
                      <span className="text-sm">{mod._nViewCount}</span>
                    </div>
                  </div>
                </div>

                {/* Dates - Horizontal Layout */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="w-4 h-4" />
                    <span>Added: {formatDate(mod._tsDateAdded)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="w-4 h-4" />
                    <span>Updated: {formatDate(mod._tsDateModified)}</span>
                  </div>
                </div>

                {/* Tags */}
                {mod._aTags && mod._aTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {mod._aTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Separator */}
              <div className="border-t border-gray-200 dark:border-gray-700" />

              {/* Context Switch - Sticky */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                  <button
                    onClick={() => setDetailsContext('info')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 transition-colors ${
                      detailsContext === 'info'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FaInfoCircle className="w-4 h-4" />
                    <span>Info</span>
                  </button>
                  <button
                    onClick={() => setDetailsContext('files')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 transition-colors ${
                      detailsContext === 'files'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FaFileAlt className="w-4 h-4" />
                    <span>Files</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {isLoadingDetails ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : detailsContext === 'info' ? (
                  <div 
                    className="prose dark:prose-invert max-w-none prose-sm"
                    dangerouslySetInnerHTML={{ __html: modDetails?._sText || '' }}
                  />
                ) : (
                  <div className="space-y-2">
                    {modDetails?._aFiles?.map((file, index) => (
                      <div 
                        key={index} 
                        className="group relative p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{file._sFile}</span>
                          <span className="text-xs text-gray-500">{formatFileSize(file._nFilesize)}</span>
                        </div>
                        {file._sDescription && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{file._sDescription}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Downloads: {file._nDownloadCount}</span>
                          <span>•</span>
                          <span>Added: {formatDate(file._tsDateAdded)}</span>
                        </div>
                        {/* Install Button - Appears on Hover */}
                        <button
                          onClick={() => handleInstallFile(file._idRow)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          Install
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
              <button
                onClick={handleOpenMod}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                <IoOpenOutline className="w-4 h-4" />
                <span>GameBanana</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Image Preview */}
      {isImagePreviewOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center"
          onClick={() => setIsImagePreviewOpen(false)}
        >
          <div className="relative w-full h-full">
            <ImageDisplay
              filePath={imageUrl}
              alt={currentImage._sCaption}
              fill
              className="object-contain"
              deferredEffect={true}
            />
            <button
              onClick={() => setIsImagePreviewOpen(false)}
              className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70"
            >
              <IoClose className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 