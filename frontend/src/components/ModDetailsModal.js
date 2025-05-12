'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ModDetailsModal({ modData, onClose, onInstall }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const toggleFileSelection = (fileId) => {
    if (fileId == null) return; // Don't add null values
    
    setSelectedFiles(prev => 
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleInstall = async (selectedFileIds) => {
    if (!modData || selectedFileIds.length === 0) return;

    // Make sure we're sending just the IDs
    const selectedFiles = selectedFileIds.map(id => Number(id));

    console.log('Installing files:', selectedFiles); // Debug log
    await onInstall(selectedFiles);

    setSelectedFiles([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{modData._sName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Preview Image */}
        {modData._aPreviewMedia?._aImages?.[0] && (
          <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
            <Image
              src={`${modData._aPreviewMedia._aImages[0]._sBaseUrl}/${modData._aPreviewMedia._aImages[0]._sFile530 || modData._aPreviewMedia._aImages[0]._sFile}`}
              alt={modData._sName}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Mod Info */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Author:</span> {modData._aSubmitter._sName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Category:</span> {modData._aSuperCategory._sName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Character:</span> {modData._aCategory._sName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold">Version:</span> {modData._sVersion || '1.0'}
          </p>
        </div>

        {/* Available Files */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Available Files</h3>
          <div className="space-y-2">
            {modData._aFiles
              .filter(file => file._sAnalysisState === 'done' && file._sAnalysisResultCode === 'ok')
              .map(file => (
                <div
                  key={file._idRow}
                  className="flex items-center p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    id={`file-${file._idRow}`}
                    checked={selectedFiles.includes(file._idRow)}
                    onChange={() => toggleFileSelection(file._idRow)}
                    className="mr-2"
                  />
                  <label htmlFor={`file-${file._idRow}`} className="flex-1">
                    <div className="font-medium">{file._sFile}</div>
                    {file._sDescription && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {file._sDescription}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {(file._nFilesize / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </label>
                </div>
              ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => handleInstall(selectedFiles)}
            disabled={selectedFiles.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Install Selected
          </button>
        </div>
      </div>
    </div>
  );
}
