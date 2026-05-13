"use client";

import { useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { uploadTemplateAction, deleteTemplateConfig } from "@/actions/manageEventConfig";
import { cn } from "@/lib/utils";

export default function UploadTemplateButton({ cardId, eventId, templateUrl }: { cardId: string, eventId: string, templateUrl: string | null }) {

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleButtonClick = async () => {
    if(!templateUrl) {
      // We do not have a template url, so we trigger the file system
      fileInputRef.current?.click();
    }else {
      // We have a template URL, so we delete the templateUrl and its configuration
      const res = await deleteTemplateConfig(cardId, eventId);

      if(res?.error) {
        toast.error("Failed to reset template");
        return;
      }

      toast.success("Template was successfully reset")
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }


    const formData = new FormData();
    formData.append("file", file);
    formData.append("eventId", eventId);
    formData.append("cardId", cardId);
  
    startTransition(async () => {
      const result = await uploadTemplateAction(formData);

      if (result?.error) {
        toast.error(result.message);
        return;
      }

      toast.success("Upload successful!");
    });
  };

  return (
    <div className="">
      <Button
        onClick={handleButtonClick}
        disabled={isPending}
        className={cn("bg-green-800 text-white hover:bg-green-800/90 font-lato text-wrap w-full", templateUrl && "bg-destructive hover:bg-destructive/75")}
      >
        {isPending && !templateUrl ? "Uploading..." : !templateUrl ? "Upload Card Template": "Reset card template"}
      </Button>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
