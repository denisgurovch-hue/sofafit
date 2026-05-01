import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoUploaderProps {
  onPhotoSelected: (dataUrl: string) => void;
}

const PhotoUploader = ({ onPhotoSelected }: PhotoUploaderProps) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 2048;
        let { width, height } = img;

        if (width > MAX_SIZE || height > MAX_SIZE) {
          const scale = MAX_SIZE / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          onPhotoSelected(canvas.toDataURL("image/jpeg", 0.9));
        }
      };
      img.src = URL.createObjectURL(file);
    },
    [onPhotoSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative flex flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed p-12 transition-all cursor-pointer
        ${isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/50"}
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        {isDragging ? (
          <ImageIcon className="h-10 w-10 text-primary" />
        ) : (
          <Upload className="h-10 w-10 text-primary" />
        )}
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">
          {isDragging ? t("uploader.drop") : t("uploader.dragHere")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("uploader.or")}
        </p>
      </div>
      <Button variant="outline" className="pointer-events-none">
        {t("uploader.selectFile")}
      </Button>
    </div>
  );
};

export default PhotoUploader;
