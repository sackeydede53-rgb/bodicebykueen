"use client";

import { useRef, useState } from "react";

type Props = {
  name?: string;
  defaultUrls?: string[];
};

export function ImageUploader({ name = "imageUrls", defaultUrls = [] }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urls, setUrls] = useState<string[]>(defaultUrls.filter(Boolean));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/uploads", { method: "POST", body: form });
        const text = await res.text();
        let data: { url?: string; error?: string } = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          throw new Error(
            res.ok
              ? "Upload returned an invalid response"
              : "Upload failed on the server. Enable Vercel Blob storage, then redeploy.",
          );
        }
        if (!res.ok) throw new Error(data.error || "Upload failed");
        if (!data.url) throw new Error("Upload did not return an image URL");
        uploaded.push(data.url);
      }
      setUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeUrl(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <label className="label">Images</label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => onUpload(e.target.files)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="admin-btn disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? "Uploading…" : "Upload images"}
      </button>

      <p className="text-xs text-[#6f6f6f]">
        JPG, PNG, or WebP. You can select multiple files. On Vercel, keep each
        file under about 4.5&nbsp;MB.
      </p>

      {error && <p className="text-sm text-danger">{error}</p>}

      {urls.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {urls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-[3/4] overflow-hidden bg-[#eac5cc]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeUrl(index)}
                className="absolute right-2 top-2 bg-ink/80 px-2 py-1 text-[0.6rem] uppercase tracking-[0.12em] text-[#f7f2ea] opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <input type="hidden" name={name} value={urls.join("\n")} />
    </div>
  );
}
