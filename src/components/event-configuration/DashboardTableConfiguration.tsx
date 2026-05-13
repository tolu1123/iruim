"use client";

import { cn } from "@/lib/utils";
import { IoSettingsSharp } from "@/components/icons";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { setColumn } from "@/actions/handleColumns";
import useDashboardColumns from "@/hooks/useColumns";

function DashboardTableConfiguration({
  eventId,
  tableColumns,
  role,
}: {
  eventId: string;
  tableColumns: { id: string; name: string; is_active: boolean }[];
  role: string;
}) {
  const tableCols = useDashboardColumns(eventId, tableColumns)
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
          <p className='text-lg leading-[100%] font-medium'>Customize Dashboard Table</p>
          <p className='text-base'>
            This is where you control what you see on the table of the event. (Once you toggle
            off a column, it will not appear on the dashboard table)
          </p>
        </div>
      </div>

      <div className='pl-8.5 flex flex-col gap-4'>
        {tableCols.map((col) => (
          <div key={col.id} className='flex items-center gap-3'>
            <Checkbox
              className='size-5 data-[state=checked]:bg-green-800! data-[state=checked]:border-white!'
              id={`toggle-${col.id}`}
              disabled={role === "Manager"}
              checked={col.is_active}
              onCheckedChange={async (checked) => {
                const res = await setColumn(eventId, col.id, checked as boolean);
                if (res?.error) {
                  toast.error(res.message);
                  return;
                }
                toast.success("Need updated successfully");
              }}
            />
            <Label htmlFor={`toggle-${col.id}`} className='text-white'>
              {col.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardTableConfiguration;
