"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GoChevronLeft } from "@/components/icons";
import clsx from "clsx";

const BackButton = ({ className }: { className?: string }) => {
  const router = useRouter();

  return (
    <Button
      variant="link"
      className={clsx("p-0", className)}
      onClick={() => router.back()}
    >
      <GoChevronLeft />
      Back
    </Button>
  );
};

export default BackButton;
