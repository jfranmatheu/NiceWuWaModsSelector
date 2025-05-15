import Image from 'next/image';
import React, { useState } from 'react';
import useSettingsStore from '@/store/settingsStore';

const ImageDisplay = ({ filePath, relative = false, alt = 'Image', className = '', ...props }) => {
  const { settings, isLoading: settingsLoading, error: settingsError } = useSettingsStore();
  const [error, setError] = useState(null);
  let imageUrl = null;
  let encodedPath = null;
  let absolutePath = null;

  if (filePath.startsWith('http')) {
    imageUrl = filePath;
  }
  else{
    // Encode the filepath to handle special characters
    absolutePath = relative ? `${settings.mods_dir}/${filePath}` : filePath;
    encodedPath = encodeURIComponent(absolutePath);
    imageUrl = `http://localhost:8000/api/image/${encodedPath}`;
  }

  // console.log("imageUrl for: ", filePath, " is: ", imageUrl);

  if (settingsLoading) {
    return <div>Loading...</div>;
  }

  if (settingsError) {
    return <div>Error loading settings: {settingsError}</div>;
  }

  if (error) {
    return <div>Error loading image: {error} - {encodedPath} - {imageUrl}</div>;
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      onError={() => setError('Failed to load image')}
      className={`w-full h-auto ${className}`}
      {...props}
    />
  );
};

export default ImageDisplay;