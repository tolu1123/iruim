"use client";

import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { IoClose } from "@/components/icons";
import { cn } from "@/lib/utils";

export default function MyDropzone({
  value,
  onChange,
}: {
  // Value has to be a type of string or file because on editing events, you could have an uploaded image,
  // which you may want to edit or remove, but the thing is that it should not require by force to upload
  // a picture whenever this component is called in an edit form
  value: (File | string)[];
  onChange: (files: (File | string)[]) => void;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      onChange([acceptedFiles[0]]);
    },
  });

  return (
    <>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-lightolive rounded-xl p-8 md:py-14 text-center cursor-pointer transition-colors text-olive flex flex-col items-center justify-center gap-4",
          isDragActive ? "bg-muted" : "bg-background"
        )}
      >
        <input {...getInputProps()} />
        <p className='t'>
          {isDragActive ? (
            "Drop files here..."
          ) : (
            <Image
              src='/imageUpload.png'
              width={85}
              height={85}
              alt='Upload Icon'
            />
          )}
        </p>
        <p className='text-sm'>
          Drag and drop files/images here, or click to select files.
        </p>
      </div>

      {/* Preview List */}
      {value && value.length > 0 && (
        <ul className='mt-4 list-disc pl-5 text-sm text-muted-foreground'>
          {value.map((file, index) =>
             (
              <li key={index} className='break-all flex gap-1'>
                {/* if the file has already been uploaded, just display the name */}
                {/* Or else display the file name */}
                <span className="">{typeof file === "string" ? file: file.name}</span>
                {/* Onclicking we use this to remove the file */}
                <span className='inline-block cursor-pointer' onClick={() => {
                  onChange(value.filter((_, i) => i !== index))
                }}>
                  {" "}
                  <IoClose className='text-bluredolive size-4' />
                </span>
              </li>
            )
          )}
        </ul>
      )}
    </>
  );
}