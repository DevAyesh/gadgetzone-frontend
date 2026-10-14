"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { UploadCloud, X, Trash2, Image as ImageIcon, Link as LinkIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImageUploaderProps {
  /**
   * Files selected from the local device
   */
  stagedFiles: File[];
  /**
   * Callback invoked when the staged local files list changes
   */
  onStagedFilesChange: (files: File[]) => void;
  /**
   * External image URL string (if any)
   */
  imageUrl?: string;
  /**
   * Callback invoked when external image URL changes
   */
  onImageUrlChange?: (url: string) => void;
  /**
   * Existing image URLs (e.g. for edit product page)
   */
  existingImages?: string[];
  /**
   * Callback invoked when an existing image is removed/restored
   */
  onRemoveExistingImage?: (url: string) => void;
  /**
   * List of existing image URLs marked for deletion
   */
  removedExistingImages?: string[];
  /**
   * Maximum allowed files from device (default: 10)
   */
  maxFiles?: number;
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function StagedImageThumbnail({ file }: { file: File }) {
  const [objectUrl] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return URL.createObjectURL(file);
      } catch {
        return "";
      }
    }
    return "";
  });

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  if (!objectUrl) {
    return <ImageIcon className="h-8 w-8 text-muted-foreground/50" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={objectUrl}
      alt={file.name}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
  );
}

export function ProductImageUploader({
  stagedFiles,
  onStagedFilesChange,
  imageUrl = "",
  onImageUrlChange,
  existingImages = [],
  onRemoveExistingImage,
  removedExistingImages = [],
  maxFiles = 10,
}: ProductImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = useCallback(
    (filesToAdd: FileList | File[]) => {
      setErrorMessage(null);
      const validFiles: File[] = [];
      const currentCount = stagedFiles.length;

      for (let i = 0; i < filesToAdd.length; i++) {
        const file = filesToAdd[i];
        const lastDot = file.name.lastIndexOf(".");
        const ext = lastDot !== -1 ? file.name.slice(lastDot).toLowerCase() : "";
        const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());
        const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

        if (!isMimeValid && !isExtValid) {
          setErrorMessage(`"${file.name}" is not a supported image format. Please select PNG, JPG, JPEG, or WEBP.`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          setErrorMessage(`"${file.name}" exceeds the 10MB maximum file size limit.`);
          continue;
        }

        // Avoid adding duplicate file instances
        const alreadyStaged = stagedFiles.some(
          (f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
        );
        if (!alreadyStaged) {
          validFiles.push(file);
        }
      }

      if (currentCount + validFiles.length > maxFiles) {
        setErrorMessage(`You can upload a maximum of ${maxFiles} images per product.`);
        const allowedSlots = Math.max(0, maxFiles - currentCount);
        validFiles.splice(allowedSlots);
      }

      if (validFiles.length > 0) {
        onStagedFilesChange([...stagedFiles, ...validFiles]);
      }
    },
    [stagedFiles, onStagedFilesChange, maxFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        validateAndAddFiles(e.dataTransfer.files);
      }
    },
    [validateAndAddFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleRemoveStagedFile = (indexToRemove: number) => {
    const updated = stagedFiles.filter((_, idx) => idx !== indexToRemove);
    onStagedFilesChange(updated);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
    // Reset file input value so selecting the same file again triggers change event
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {/* ─── Drag & Drop / Device Upload Area ──────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-primary" />
            Upload Product Images from Device
          </label>
          <span className="text-xs text-muted-foreground font-medium">
            {stagedFiles.length}/{maxFiles} staged
          </span>
        </div>

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-primary bg-primary/10 shadow-lg scale-[1.01]"
              : "border-border/70 hover:border-primary/60 hover:bg-muted/40 bg-card/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            name="device_images"
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                <span className="text-primary font-semibold hover:underline">Click to browse</span> or drag and drop images here
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PNG, JPG, JPEG, and WEBP (Up to 10MB per file)
              </p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium border border-destructive/20 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* ─── Staged Local Files Interactive Previews ────────────────── */}
      {stagedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Staged Files from Device ({stagedFiles.length})
            </span>
            <button
              type="button"
              onClick={() => onStagedFilesChange([])}
              className="text-xs text-destructive hover:underline font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {stagedFiles.map((file, index) => {
              return (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="group relative rounded-xl border border-border/60 bg-muted/30 overflow-hidden shadow-sm transition hover:shadow-md"
                >
                  <div className="aspect-square w-full relative bg-muted flex items-center justify-center overflow-hidden">
                    <StagedImageThumbnail file={file} />

                    {/* Staged Badge */}
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white backdrop-blur-sm">
                      {index === 0 ? "PRIMARY" : `FILE #${index + 1}`}
                    </span>

                    {/* Interactive Remove Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStagedFile(index);
                      }}
                      title="Remove image"
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive shadow-md transition-transform hover:scale-110"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="p-2 space-y-0.5 bg-card">
                    <p className="text-xs font-medium text-foreground truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Existing Images (For Edit Page) ────────────────────────── */}
      {existingImages.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border/40">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Current Product Images ({existingImages.length})
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {existingImages.map((url, idx) => {
              const isMarkedRemoved = removedExistingImages.includes(url);
              return (
                <div
                  key={url}
                  className={`group relative rounded-xl border overflow-hidden shadow-sm transition ${
                    isMarkedRemoved
                      ? "border-destructive/40 bg-destructive/10 opacity-60"
                      : "border-border/60 bg-muted/30"
                  }`}
                >
                  <div className="aspect-square w-full relative bg-muted flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Product image ${idx + 1}`}
                      className={`h-full w-full object-cover transition-transform duration-300 ${
                        isMarkedRemoved ? "grayscale" : "group-hover:scale-105"
                      }`}
                    />
                    {isMarkedRemoved && (
                      <div className="absolute inset-0 bg-destructive/30 flex items-center justify-center">
                        <span className="px-2 py-0.5 rounded bg-destructive text-[11px] font-bold text-destructive-foreground">
                          Marked for Removal
                        </span>
                      </div>
                    )}
                    {onRemoveExistingImage && (
                      <button
                        type="button"
                        onClick={() => onRemoveExistingImage(url)}
                        title={isMarkedRemoved ? "Undo remove" : "Delete image"}
                        className={`absolute top-1.5 right-1.5 p-1 rounded-full shadow-md transition-transform hover:scale-110 ${
                          isMarkedRemoved
                            ? "bg-primary text-primary-foreground"
                            : "bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                        }`}
                      >
                        {isMarkedRemoved ? <X className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── External Image URL Input ──────────────────────────────── */}
      {onImageUrlChange && (
        <div className="space-y-2 pt-2 border-t border-border/40">
          <label className="text-sm font-semibold flex items-center gap-2" htmlFor="image_url">
            <LinkIcon className="h-4 w-4 text-primary" />
            Or Enter External Image URL (Optional)
          </label>
          <div className="flex gap-2">
            <input
              id="image_url"
              name="image_url"
              type="url"
              value={imageUrl}
              onChange={(e) => onImageUrlChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="https://images.unsplash.com/photo-..."
            />
            {imageUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onImageUrlChange("")}
                className="shrink-0 text-xs"
              >
                Clear
              </Button>
            )}
          </div>
          {imageUrl && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/40 border border-border/40">
              <div className="h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="External URL preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{imageUrl}</p>
                <p className="text-[10px] text-muted-foreground">External Image URL</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
