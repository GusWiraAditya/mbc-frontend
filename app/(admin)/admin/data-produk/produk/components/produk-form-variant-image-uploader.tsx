// app/admin/produk/produk-form-variant-image-uploader.tsx

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X as XIcon, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "./produk-columns";
import { Input } from "@/components/ui/input";

interface VariantImageUploaderProps {
  existingImages: ProductImage[];
  newImageFiles: File[];
  onUpdateNewFiles: (files: File[]) => void;
  onAddExistingImageToDelete: (imageId: number) => void;
}

export function VariantImageUploader({
  existingImages,
  newImageFiles,
  onUpdateNewFiles,
  onAddExistingImageToDelete,
}: VariantImageUploaderProps) {
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [editingImage, setEditingImage] = useState<{
    type: "new" | "existing";
    index: number;
  } | null>(null);

  const handleAddNewImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files)
      onUpdateNewFiles([...newImageFiles, ...Array.from(event.target.files)]);
  };

  const triggerEdit = (type: "new" | "existing", index: number) => {
    setEditingImage({ type, index });
    editFileInputRef.current?.click();
  };

  const handleReplaceImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || editingImage === null) return;
    if (editingImage.type === "new") {
      const updatedFiles = [...newImageFiles];
      updatedFiles[editingImage.index] = file;
      onUpdateNewFiles(updatedFiles);
    } else {
      const imageToReplace = existingImages[editingImage.index];
      onAddExistingImageToDelete(imageToReplace.id);
      onUpdateNewFiles([...newImageFiles, file]);
    }
    setEditingImage(null);
  };

  const handleRemoveNewImage = (indexToRemove: number) =>
    onUpdateNewFiles(
      newImageFiles.filter((_, index) => index !== indexToRemove)
    );
  const handleRemoveExistingImage = (image: ProductImage) =>
    onAddExistingImageToDelete(image.id);

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {existingImages.map((image, index) => (
          <div key={image.id} className="relative group aspect-square">
            <Image
              src={`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${image.path}`}
              alt="Gambar"
              fill
              className="rounded-md object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10 rounded-md">
              <Button
                type="button"
                size="icon"
                className="h-7 w-7 bg-blue-600 hover:bg-blue-700"
                onClick={() => triggerEdit("existing", index)}
              >
                <Pencil size={14} />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="h-7 w-7"
                onClick={() => handleRemoveExistingImage(image)}
              >
                <XIcon size={14} />
              </Button>
            </div>
          </div>
        ))}
        {newImageFiles.map((file, index) => (
          <div key={index} className="relative group aspect-square">
            <Image
              src={URL.createObjectURL(file)}
              alt="Preview"
              fill
              className="rounded-md object-cover"
              onLoad={(e) =>
                URL.revokeObjectURL((e.target as HTMLImageElement).src)
              }
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10 rounded-md">
              <Button
                type="button"
                size="icon"
                className="h-7 w-7 bg-blue-600 hover:bg-blue-700"
                onClick={() => triggerEdit("new", index)}
              >
                <Pencil size={14} />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="h-7 w-7"
                onClick={() => handleRemoveNewImage(index)}
              >
                <XIcon size={14} />
              </Button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addFileInputRef.current?.click()}
          className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-md text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <UploadCloud size={24} />
          <span className="text-xs mt-1 text-center">Tambah</span>
        </button>
      </div>
      <Input
        id="add-images-input"
        type="file"
        multiple
        className="hidden"
        ref={addFileInputRef}
        onChange={handleAddNewImages}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onClick={(e) => (e.currentTarget.value = "")}
      />
      <Input
        id="edit-image-input"
        type="file"
        className="hidden"
        ref={editFileInputRef}
        onChange={handleReplaceImage}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onClick={(e) => (e.currentTarget.value = "")}
      />
    </div>
  );
}
