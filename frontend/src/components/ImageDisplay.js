import React, { useState, useEffect } from 'react';
import useSettingsStore from '@/store/settingsStore';
import Image from 'next/image';

const loaderStyles = `
.loader {
  width: 8px;
  height: 40px;
  border-radius: 4px;
  display: block;
  margin: 20px auto;
  position: relative;
  background: currentColor;
  color: #FFF;
  box-sizing: border-box;
  animation: animloader 0.3s 0.3s linear infinite alternate;
}

.loader::after, .loader::before {
  content: '';
  width: 8px;
  height: 40px;
  border-radius: 4px;
  background: currentColor;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 20px;
  box-sizing: border-box;
  animation: animloader 0.3s 0.45s linear infinite alternate;
}

.loader::before {
  left: -20px;
  animation-delay: 0s;
}

@keyframes animloader {
  0%   { height: 48px }
  100% { height: 4px }
}
`;

const ImageDisplay = ({ filePath, relative = false, alt = 'Image', className = '', deferredEffect = false, ...props }) => {
  const { settings, isLoading: settingsLoading, error: settingsError } = useSettingsStore();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  let imageUrl = null;
  let encodedPath = null;
  let absolutePath = null;

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = loaderStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (filePath.startsWith('http')) {
    imageUrl = filePath;
  } else {
    absolutePath = relative ? `${settings.mods_dir}/${filePath}` : filePath;
    encodedPath = encodeURIComponent(absolutePath);
    imageUrl = `http://localhost:8000/api/image/${encodedPath}`;
  }

  if (settingsLoading) {
    return <div>Loading...</div>;
  }

  if (settingsError) {
    return <div>Error loading settings: {settingsError}</div>;
  }

  if (error) {
    return <div>Error loading image: {error} - {encodedPath} - {imageUrl}</div>;
  }

  if (deferredEffect) {
    return (
      <div className="relative w-full h-full">
        {loading && (
          <div className="animate-pulse bg-gray-200 dark:bg-gray-800 absolute inset-0 z-10 flex items-center justify-center">
            <span className="loader"></span>
          </div>
        )}
        <img
          src={imageUrl}
          alt={alt}
          onError={() => setError('Failed to load image')}
          onLoad={() => setLoading(false)}
          className={`w-full h-auto object-cover transition-all duration-500 ${loading ? 'blur-md scale-105' : 'blur-0 scale-100'} ${className}`}
          style={loading ? { filter: 'blur(8px)' } : {}}
          {...props}
        />
      </div>
    );
  } else {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        onError={() => setError('Failed to load image')}
        className={`w-full h-auto ${className}`}
        {...props}
      />
    );
  }
};

export default ImageDisplay;