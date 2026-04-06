import React from 'react';

const BackgroundMedia: React.FC = () => {
  // Using a professional, abstract medical-themed video loop
  const videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-abstract-blue-and-purple-ink-in-water-40228-large.mp4';

  return (
    <div className="bg-video-container">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="bg-video"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      <div className="bg-overlay"></div>
    </div>
  );
};

export default BackgroundMedia;
