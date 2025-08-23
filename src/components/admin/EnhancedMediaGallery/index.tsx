"use client";

import React, { useState, useEffect, useRef } from "react";
import { useField, useFormFields } from "@payloadcms/ui";
import { useParams } from "next/navigation";
import type { ArrayFieldClientComponent } from "payload";
import Image from "next/image";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  ExternalLink,
  ZoomIn,
  FileText,
  File,
  Image as ImageIcon,
  VideoIcon,
  Music,
  Eye,
  X,
  Maximize2,
} from "lucide-react";
import { isValidUrl } from "@/lib/security";
import { useAdminTranslation } from "@/utilities/admin-translations";
import NextImage from "next/image";
import "./index.scss";

interface MediaItem {
  url: string;
  id?: string;
}

interface VideoPlayerProps {
  url: string;
  onError: () => void;
  dt: (key: string) => string;
}

interface AudioPlayerProps {
  url: string;
  filename: string;
  onError: () => void;
}

interface PDFViewerProps {
  url: string;
  filename: string;
  onError: () => void;
  dt: (key: string) => string;
}

interface ImageViewerProps {
  url: string;
  filename: string;
  onError: () => void;
  dt: (key: string) => string;
}

// Video Player Component
const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, onError, dt }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Set volume through ref
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div ref={containerRef} className="enhanced-video-player">
      <div className="video-container">
        <video
          ref={videoRef}
          src={url}
          className="video-element"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={onError}
          muted={isMuted}
        />

        {/* Video Controls Overlay */}
        <div className="video-controls-overlay">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="play-pause-btn"
            aria-label={isPlaying ? dt("mediaGallery.pause") : dt("mediaGallery.play")}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="video-controls">
          <div className="controls-left">
            <button onClick={togglePlay} className="control-btn">
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>

            <button onClick={toggleMute} className="control-btn">
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              className="volume-slider"
            />

            <span className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="controls-center">
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              className="progress-slider"
            />
          </div>

          <div className="controls-right">
            <button onClick={toggleFullscreen} className="control-btn">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Audio Player Component
const AudioPlayer: React.FC<AudioPlayerProps> = ({
  url,
  filename,
  onError,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Set volume through ref
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="enhanced-audio-player">
      <audio
        ref={audioRef}
        src={url}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={onError}
        muted={isMuted}
      />

      <div className="audio-controls">
        <div className="audio-info">
          <Music size={20} className="audio-icon" />
          <div className="audio-meta">
            <div className="audio-title">{filename}</div>
            <div className="audio-duration">{formatTime(duration)}</div>
          </div>
        </div>

        <div className="audio-player-controls">
          <button onClick={togglePlay} className="control-btn primary">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <div className="progress-container">
            <span className="time-current">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              className="progress-slider"
            />
            <span className="time-total">{formatTime(duration)}</span>
          </div>

          <div className="volume-controls">
            <button onClick={toggleMute} className="control-btn">
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// PDF Preview Button Component - SECURE VERSION (FIXED: XSS Prevention)
const PDFPreviewButton: React.FC<PDFViewerProps> = ({
  url,
  filename,
  onError,
  dt,
}) => {
  const [error, setError] = useState<string | null>(null);

  const openPreview = () => {
    try {
      if (isValidUrl(url)) {
        // Direct URL access (validated) - prevents XSS
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        setError("Cannot open preview - invalid media reference");
      }
    } catch (err) {
      setError(dt("mediaGallery.failedToOpenPreview"));
    }
  };

  const downloadFile = () => {
    try {
      if (!isValidUrl(url)) {
        setError(dt("mediaGallery.invalidDownloadUrl"));
        return;
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "document.pdf";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(dt("mediaGallery.downloadFailed"));
    }
  };

  // Simple error handling - just disable buttons if there's an error
  if (error) {
    return (
      <div className="pdf-preview-card">
        <div className="pdf-card-header">
          <div className="pdf-icon-wrapper">
            <FileText size={24} className="pdf-icon" />
          </div>
          <div className="pdf-meta">
            <div className="pdf-title">{filename}</div>
            <div className="pdf-badge">PDF Document - Error</div>
          </div>
        </div>
        <div className="pdf-preview-area">
          <div className="pdf-placeholder">
            <FileText size={48} className="pdf-placeholder-icon" />
            <p className="pdf-placeholder-text">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-preview-card">
      <div className="pdf-card-header">
        <div className="pdf-icon-wrapper">
          <FileText size={24} className="pdf-icon" />
        </div>
        <div className="pdf-meta">
          <div className="pdf-title">{filename}</div>
          <div className="pdf-badge">PDF Document</div>
        </div>
      </div>

      <div className="pdf-preview-area">
        <div className="pdf-placeholder">
          <FileText size={48} className="pdf-placeholder-icon" />
          <p className="pdf-placeholder-text">
            {dt("mediaGallery.clickToPreviewPDF")}
          </p>
        </div>
      </div>

      <div className="pdf-actions-bar">
        <button onClick={openPreview} className="pdf-preview-btn">
          <Eye size={18} />
          <span>{dt("mediaGallery.previewFile")}</span>
        </button>
      </div>
    </div>
  );
};

// Image Viewer Component
const ImageViewer: React.FC<ImageViewerProps> = ({
  url,
  filename,
  onError,
  dt,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageError = () => {
    setImageError(true);
    onError();
  };

  if (imageError) {
    return (
      <div className="image-error">
        <ImageIcon size={48} className="error-icon" aria-hidden="true" />
        <p>{dt("mediaGallery.unableToLoadImage")}: {filename}</p>
      </div>
    );
  }

  return (
    <div className="enhanced-image-viewer">
      <div className="image-toolbar">
        <div className="image-info">
          <ImageIcon size={20} className="image-icon" aria-hidden="true" />
          <span className="image-title">{filename}</span>
        </div>

        <div className="image-actions">
          <button
            onClick={toggleFullscreen}
            className="control-btn"
            title={dt("mediaGallery.toggleFullscreen")}
          >
            {isFullscreen ? <X size={16} /> : <Eye size={16} />}
          </button>
          <button
            onClick={downloadImage}
            className="control-btn"
            title={dt("mediaGallery.download")}
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className={`image-container ${isFullscreen ? "fullscreen" : ""}`}>
        <div className="relative w-full max-w-[800px] h-[600px]">
          <Image
            src={url}
            alt={`Preview of ${filename}`}
            fill
            className="object-contain preview-image"
            onError={handleImageError}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            priority={false}
            quality={90}
            placeholder="empty"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced Media Gallery - Advanced media preview component for Payload CMS
 * Supports video, audio, PDF, and image files with full-featured players
 */
const EnhancedMediaGallery: ArrayFieldClientComponent = ({ path }) => {
  const { locale } = useParams();
  const { dt } = useAdminTranslation();

  const fieldState = useField({
    path,
    hasRows: true,
  });

  const formFields = useFormFields(([fields]) => fields);
  const [activeMedia, setActiveMedia] = useState<string | null>(null);
  const [mediaErrors, setMediaErrors] = useState<Set<string>>(new Set());

  // Get the actual array data from form fields
  const formFieldValue = formFields[path]?.value;

  let actualData: MediaItem[] | null = null;

  // Try multiple data extraction methods

  // Method 1: Direct array from formFieldValue
  if (Array.isArray(formFieldValue)) {
    actualData = formFieldValue
      .map((item: any) => {
        // Handle both string URLs and object with url property
        if (typeof item === "string" && item.length > 0) {
          return { url: item };
        } else if (
          item &&
          typeof item === "object" &&
          typeof item.url === "string" &&
          item.url.length > 0
        ) {
          return { url: item.url };
        }
        return null;
      })
      .filter(
        (item): item is MediaItem =>
          item !== null && typeof item.url === "string" && item.url.length > 0
      );
  }

  // Method 2: From fieldState.value (primary Payload CMS source)
  else if (fieldState.value && Array.isArray(fieldState.value)) {
    actualData = fieldState.value
      .map((item: any) => {
        // Handle both string URLs and object with url property
        if (typeof item === "string" && item.length > 0) {
          return { url: item };
        } else if (
          item &&
          typeof item === "object" &&
          typeof item.url === "string" &&
          item.url.length > 0
        ) {
          return { url: item.url };
        }
        return null;
      })
      .filter(
        (item): item is MediaItem =>
          item !== null && typeof item.url === "string" && item.url.length > 0
      );
  }

  // Method 3: From fieldState.rows
  else if (fieldState.rows && Array.isArray(fieldState.rows)) {
    const rowData: MediaItem[] = fieldState.rows
      .map((row: any, index: number) => {
        const rowPath = `${path}.${index}`;

        // Try different ways to get the URL
        let url: string | null = null;

        // Method 3a: Direct from row.url
        if (typeof row?.url === "string") {
          url = row.url;
        }
        // Method 3b: From row itself if it's a string
        else if (typeof row === "string") {
          url = row;
        }
        // Method 3c: From form fields at rowPath
        else if (formFields[rowPath]?.value) {
          const rowValue = formFields[rowPath].value;
          if (typeof rowValue === "string") {
            url = rowValue;
          } else if (
            rowValue &&
            typeof rowValue === "object" &&
            "url" in rowValue &&
            typeof (rowValue as any).url === "string"
          ) {
            url = (rowValue as any).url;
          }
        }
        // Method 3d: From form fields at rowPath.url
        else if (formFields[`${rowPath}.url`]?.value) {
          url = formFields[`${rowPath}.url`].value as string;
        }

        return url ? { url } : null;
      })
      .filter(
        (item): item is MediaItem =>
          item !== null && typeof item.url === "string"
      );

    if (rowData.length > 0) {
      actualData = rowData;
    }
  }

  // Method 4: Fallback - look for numbered field entries
  else {
    const numberedFields: MediaItem[] = [];
    let index = 0;

    while (
      formFields[`${path}.${index}`] ||
      formFields[`${path}.${index}.url`]
    ) {
      const rowValue =
        formFields[`${path}.${index}`]?.value ||
        formFields[`${path}.${index}.url`]?.value;

      if (typeof rowValue === "string") {
        numberedFields.push({ url: rowValue });
      } else if (
        rowValue &&
        typeof rowValue === "object" &&
        "url" in rowValue &&
        typeof (rowValue as any).url === "string"
      ) {
        numberedFields.push({ url: (rowValue as any).url });
      }

      index++;
      if (index > 50) break; // Safety limit
    }

    if (numberedFields.length > 0) {
      actualData = numberedFields;
    }
  }

  // Handle empty state
  if (!actualData || !Array.isArray(actualData) || actualData.length === 0) {
    // Check if this is legacy data (old submissions before the V3 fix)
    // Legacy data has typeof number, new empty submissions have empty arrays or undefined
    const isActualLegacyData =
      (typeof formFieldValue === "number" && formFieldValue !== 0) ||
      (typeof fieldState.value === "number" && fieldState.value !== 0);

    return (
      <div className="enhanced-media-gallery">
        <div className="empty-state">
          <File size={48} className="empty-icon" />
          <span className="empty-text">{dt("mediaGallery.noMediaAvailable")}</span>
        </div>
      </div>
    );
  }

  const getFileType = (url: string): string => {
    const extension = url.toLowerCase().split(".").pop() || "";
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(extension))
      return "image";
    if (["mp4", "avi", "mov", "wmv", "webm", "mkv"].includes(extension))
      return "video";
    if (["mp3", "wav", "ogg", "aac", "flac", "m4a"].includes(extension))
      return "audio";
    if (["pdf"].includes(extension)) return "pdf";
    if (["doc", "docx", "txt"].includes(extension)) return "document";
    return "file";
  };

  const getFileIcon = (fileType: string): React.ReactElement => {
    switch (fileType) {
      case "image":
        return <ImageIcon size={24} aria-hidden="true" />;
      case "video":
        return <VideoIcon size={24} aria-hidden="true" />;
      case "audio":
        return <Music size={24} aria-hidden="true" />;
      case "pdf":
        return <FileText size={24} aria-hidden="true" />;
      case "document":
        return <FileText size={24} aria-hidden="true" />;
      default:
        return <File size={24} aria-hidden="true" />;
    }
  };

  const getFileName = (url: string): string => {
    return url.split("/").pop()?.split("?")[0] || dt("mediaGallery.unknownFile");
  };

  const handleMediaError = (url: string) => {
    setMediaErrors((prev) => new Set([...prev, url]));
  };

  const renderMediaPreview = (item: MediaItem, index: number) => {
    // Ensure URL is properly formatted
    const mediaUrl = item.url.startsWith("http")
      ? item.url
      : item.url.startsWith("/")
      ? item.url
      : `/${item.url}`;

    const fileType = getFileType(mediaUrl);
    const fileName = getFileName(mediaUrl);
    const hasError = mediaErrors.has(mediaUrl);
    const isActive = activeMedia === mediaUrl;

    if (hasError) {
      return (
        <div key={`error-${index}`} className="media-item error">
          <div className="media-error">
            <File size={48} className="error-icon" />
            <p className="error-text">{dt("mediaGallery.loadingError")}</p>
            <p className="error-filename">{fileName}</p>
            <small
              className="error-url"
              style={{ fontSize: "10px", color: "#999" }}
            >
              {mediaUrl}
            </small>
          </div>
        </div>
      );
    }

    return (
      <div key={`media-${index}`} className="media-item auto-preview">
        {/* Enhanced image thumbnail with card design */}
        {fileType === "image" && (
          <div className="relative w-full h-48 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200">
            <div 
              className="relative w-full h-full cursor-pointer group"
              onClick={() => setActiveMedia(isActive ? null : mediaUrl)}
            >
              <Image
                src={mediaUrl}
                alt={`Thumbnail preview of ${fileName}`}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                onError={() => handleMediaError(mediaUrl)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100">
                <span className="text-white text-sm font-medium text-center px-3">
                  {dt("mediaGallery.clickToEnlarge")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PDF preview with simple button */}
        {fileType === "pdf" && (
          <div className="media-pdf-preview">
            <PDFPreviewButton
              url={mediaUrl}
              filename={fileName}
              onError={() => handleMediaError(mediaUrl)}
              dt={dt}
            />
          </div>
        )}

        {/* For video - show thumbnail with play overlay */}
        {fileType === "video" && (
          <div className="media-video-preview">
            <video
              src={mediaUrl}
              className="video-thumbnail"
              onError={() => handleMediaError(mediaUrl)}
              onClick={() => setActiveMedia(isActive ? null : mediaUrl)}
              muted
              preload="metadata"
            />
            <div
              className="video-play-overlay"
              onClick={() => setActiveMedia(isActive ? null : mediaUrl)}
            >
              <Play size={32} className="play-icon" />
            </div>
          </div>
        )}

        {/* Audio files - show compact player */}
        {fileType === "audio" && (
          <div className="media-audio-preview">
            <div className="audio-info-compact">
              <Music size={20} className="audio-icon" />
              <span className="audio-filename">{fileName}</span>
            </div>
            <audio
              src={mediaUrl}
              controls
              className="audio-compact"
              onError={() => handleMediaError(mediaUrl)}
              preload="metadata"
            />
          </div>
        )}

        {/* For other file types, show enhanced icon preview */}
        {!["image", "pdf", "video", "audio"].includes(fileType) && (
          <div className="media-file-preview">
            <div className="file-icon-large">{getFileIcon(fileType)}</div>
            <span className="file-info">{fileName}</span>
          </div>
        )}

        <div className="media-header">
          <div className="media-info">
            {getFileIcon(fileType)}
            <div className="media-meta">
              <span className="media-title">{fileName}</span>
              <span className="media-type">{fileType.toUpperCase()}</span>
            </div>
          </div>

          {/* Keep the expand button for full-featured players */}
          {["video", "image"].includes(fileType) && (
            <button
              onClick={() => setActiveMedia(isActive ? null : mediaUrl)}
              className="preview-toggle"
              title={isActive ? dt("mediaGallery.closeExpandedView") : dt("mediaGallery.expandView")}
            >
              {isActive ? <X size={16} /> : <Maximize2 size={16} />}
            </button>
          )}
        </div>

        {/* Expanded view with full-featured players */}
        {isActive && (
          <div className="media-preview-expanded">
            {fileType === "video" && (
              <VideoPlayer
                url={mediaUrl}
                onError={() => handleMediaError(mediaUrl)}
                dt={dt}
              />
            )}

            {fileType === "image" && (
              <ImageViewer
                url={mediaUrl}
                filename={fileName}
                onError={() => handleMediaError(mediaUrl)}
                dt={dt}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="enhanced-media-gallery">
      <div className="media-header">
        <h4 className="media-title">
          {dt("mediaGallery.mediaFiles")} ({actualData.length})
        </h4>
      </div>

      <div className="media-list">
        {actualData.map((item, index) => renderMediaPreview(item, index))}
      </div>
    </div>
  );
};

export default EnhancedMediaGallery;
