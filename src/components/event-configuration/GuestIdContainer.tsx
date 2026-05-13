"use client";

import { useEffect, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Rnd } from "react-rnd";
import { Input } from "@/components/ui/input";
import { IDProp } from "@/components/event-configuration/CardConfigDialog";
import { useIsMobile } from "@/hooks/useIsMobile";

interface DefaultIDProp {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function GuestIdContainer({
  idProp,
  setID,
}: {
  idProp: IDProp;
  setID: React.Dispatch<React.SetStateAction<IDProp>>;
}) {
  const idRef = useRef<Rnd | null>(null);
  const isMobile = useIsMobile(640);
  const textVal = crypto.randomUUID();

  useEffect(() => {
    if (idRef.current) {
      idRef.current.getSelfElement()?.click();
    }
  }, [isMobile]);
  const rawIdProp = Object.assign({}, idProp);
  const defaultProp = Object.fromEntries(Object.entries(rawIdProp).map(e => e[0] == "height"? ["height", Math.ceil(parseInt(idProp.fontSize))]: e).filter(e => e[0] !== "fontSize")) as DefaultIDProp;
  return (
    <Rnd
      bounds='parent'
      ref={idRef}
      key={`${isMobile}-id`}
      default={defaultProp}
      position={{
        x: idProp.x,
        y: idProp.y,
      }}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onResizeStop={(e, direction, ref, delta, position) => {
        // You can handle the new size and position here if needed
        setID((prev) => ({
          ...prev,
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        }));
      }}
      onDragStop={(e, data) => {
        setID((prev) => ({
          ...prev,
          x: data.x,
          y: data.y,
        }));
      }}
    >
      <div className=''>
        <Popover>
          <PopoverTrigger className='w-full h-full'>
            <Input
              style={{
                fontSize: idProp.fontSize,
              }}
              className={`w-full h-full p-0!`}
              value={textVal}
              disabled
            />
          </PopoverTrigger>
          <PopoverContent className='bg-white/40 backdrop-blur-sm'>
            <div className='flex items-center gap-1'>
              <label htmlFor='text-size' className='text-sm'>
                Text size:
              </label>
              <Select
                value={`${Math.ceil(parseInt(idProp.fontSize))}px`}
                onValueChange={(value) => {
                  setID((prev) => ({ ...prev, fontSize: value }));
                }}
              >
                <SelectTrigger id='text-size' className='w-[180px]'>
                  <SelectValue
                    className='text-sm!'
                    placeholder='Enter text size'
                  />
                </SelectTrigger>
                <SelectContent>
                  {/* The value prop in SelectItem should match the state format */}
                  {Array.from({ length: 30}, (v, i) => {
                    const sizeValue = `${i}px`; // e.g., "9px", "10px"
                    return (
                      <SelectItem key={i} value={sizeValue}>
                        {sizeValue}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </Rnd>
  );
}
