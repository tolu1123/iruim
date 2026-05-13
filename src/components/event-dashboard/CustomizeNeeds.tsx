"use client";

import { cn } from "@/lib/utils";
import { IoSettingsSharp } from "@/components/icons";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { setNeed } from "@/actions/handleNeeds";
import { toast } from "sonner";

const titleCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

function CustomizeNeeds({
  eventId,
  needs,
  role,
}: {
  eventId: string;
  needs: { id: string; name: string; is_active: boolean }[];
  role: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 my-5 p-5 bg-green-800 rounded-lg text-border green-800 border-green-800",
        role === "Manager" && "opacity-50"
      )}
    >
      <div className='flex gap-2.5 sm:gap-2'>
        <div className=''>
          <IoSettingsSharp className='size-6 leading-[100%]' />
        </div>
        <div className='flex flex-col gap-1 items-start'>
          <p className='text-lg leading-[100%] font-medium'>Customize needs</p>
          <p className='text-base'>
            This is where you control the needs of the event. (Once you toggle
            off a need, invitee needs will not be able to be toggled when
            verifying them)
          </p>
        </div>
      </div>

      <div className='pl-8.5 flex flex-col gap-4'>
        {needs.map((need) => (
          <div key={need.id} className='flex items-center gap-3'>
            <Checkbox
              className='size-5 data-[state=checked]:bg-green-800! data-[state=checked]:border-white!'
              id={`toggle-${need.id}`}
              disabled={role === "Manager"}
              checked={need.is_active}
              onCheckedChange={async (checked) => {
                const res = await setNeed(eventId, need.id, checked as boolean);
                if (res?.error) {
                  toast.error(res.message);
                  return;
                }
                toast.success("Need updated successfully");
              }}
            />
            <Label htmlFor={`toggle-${need.id}`} className='text-white'>
              {titleCase(need.name.replace("_", " "))}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomizeNeeds;
