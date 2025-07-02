"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Attribute } from "./AttributeTabs";
import { Textarea } from "@/components/ui/textarea";

// Skema validasi dinamis
const getAttributeSchema = (attributeName: string) => z.object({
  name: z.string().min(2, { message: `${attributeName} name must be at least 2 characters.` }),
  code: z.string().optional(),
  hex_code: z.string().optional(),
  description: z.string().optional(),
});

interface AttributeFormProps {
  attributeName: string;
  initialData?: Attribute | null;
  onSubmit: (data: z.infer<ReturnType<typeof getAttributeSchema>>) => Promise<void>;
  onClose: () => void;
}

export function AttributeForm({ attributeName, initialData, onSubmit, onClose }: AttributeFormProps) {
  const schema = getAttributeSchema(attributeName);
  type FormValues = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
       hex_code: initialData?.hex_code || "",
       description: initialData?.description || ""
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
      <div>
        <Label className="mb-2" htmlFor="name">Nama {attributeName}</Label>
        <Input id="name" {...register("name")} disabled={isSubmitting} />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
      </div>
      {attributeName === 'Color' && (
        <div>
          <Label className="mb-2" htmlFor="hex_code">Kode Hex (#RRGGBB)</Label>
          <Input id="hex_code" {...register("hex_code")} disabled={isSubmitting} />
        </div>
      )}
      {attributeName === 'Material' && (
       <div>
          <Label className="mb-2" htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Deskripsi material"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
        </div>
      )}
      {attributeName === 'Size' && (
        <>
         <div>
          <Label className="mb-2" htmlFor="code">Kode (S, M, L)</Label>
          <Input id="code" {...register("code")} disabled={isSubmitting} />
         
        </div>
        
         <div>
          <Label className="mb-2" htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Deskripsi ukuran"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
        </div>
        </>
        
        
      )}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Batal</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : `Simpan ${attributeName}`}
        </Button>
      </div>
    </form>
  );
}