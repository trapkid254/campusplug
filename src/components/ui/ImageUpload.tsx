"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageUpload({
  images,
  onChange,
  maxImages = 6,
}: {
  images: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setUploading(true);

    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (images.length + newUrls.length >= maxImages) break;

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        newUrls.push(data.url);
      } else {
        setError(data.error || "Upload failed");
        break;
      }
    }

    if (newUrls.length > 0) {
      onChange([...images, ...newUrls]);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">Property Photos</label>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((url, i) => (
            <div key={url + i} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200">
              <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="200px" />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 transition hover:border-emerald-400 hover:bg-emerald-50/50",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          ) : (
            <Upload className="h-8 w-8 text-slate-400" />
          )}
          <p className="mt-2 text-sm font-medium text-slate-600">
            {uploading ? "Uploading..." : "Click or drag photos here"}
          </p>
          <p className="mt-1 text-xs text-slate-400">JPEG, PNG, WebP up to 5MB · {images.length}/{maxImages}</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
