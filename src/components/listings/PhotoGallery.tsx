"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import type { ListingPhoto } from "@/types"

interface PhotoGalleryProps {
  photos: ListingPhoto[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (photos.length === 0) {
    return (
      <div className="aspect-[16/9] bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
        No photos available
      </div>
    )
  }

  const sortedPhotos = [...photos].sort((a, b) => a.order - b.order)

  function openLightbox(index: number) {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  function nextPhoto() {
    setCurrentIndex((prev) => (prev + 1) % sortedPhotos.length)
  }

  function prevPhoto() {
    setCurrentIndex(
      (prev) => (prev - 1 + sortedPhotos.length) % sortedPhotos.length
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-xl overflow-hidden">
        <div
          className="md:col-span-2 md:row-span-2 relative aspect-[4/3] md:aspect-auto cursor-pointer"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={sortedPhotos[0].url}
            alt={sortedPhotos[0].caption || "Listing photo"}
            fill
            className="object-cover hover:opacity-90 transition-opacity"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        {sortedPhotos.slice(1, 5).map((photo, idx) => (
          <div
            key={photo.id}
            className={cn(
              "relative aspect-[4/3] cursor-pointer hidden md:block",
              idx === 3 && sortedPhotos.length > 5 && "relative"
            )}
            onClick={() => openLightbox(idx + 1)}
          >
            <Image
              src={photo.url}
              alt={photo.caption || "Listing photo"}
              fill
              className="object-cover hover:opacity-90 transition-opacity"
              sizes="25vw"
            />
            {idx === 3 && sortedPhotos.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  +{sortedPhotos.length - 5} more
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-white/80 z-10"
          >
            <X className="h-8 w-8" />
          </button>
          <button
            onClick={prevPhoto}
            className="absolute left-4 text-white hover:text-white/80 z-10"
          >
            <ChevronLeft className="h-10 w-10" />
          </button>
          <button
            onClick={nextPhoto}
            className="absolute right-4 text-white hover:text-white/80 z-10"
          >
            <ChevronRight className="h-10 w-10" />
          </button>
          <div className="relative w-full max-w-4xl aspect-[16/10] mx-8">
            <Image
              src={sortedPhotos[currentIndex].url}
              alt={sortedPhotos[currentIndex].caption || "Photo"}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <div className="absolute bottom-4 text-white text-sm">
            {currentIndex + 1} / {sortedPhotos.length}
            {sortedPhotos[currentIndex].caption && (
              <span className="ml-2 text-white/70">
                — {sortedPhotos[currentIndex].caption}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  )
}