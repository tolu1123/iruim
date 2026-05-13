"use client";
import { useState } from "react";
import CanvasControl from "@/components/event-configuration/CanvasControl";
import { Rnd } from "react-rnd";
import GuestIdContainer from "@/components/event-configuration/GuestIdContainer";

import { EventCardConfigType } from "@/components/event-configuration/EventCardsContainer";
import { QRProp, IDProp } from "@/components/event-configuration/CardConfigDialog";
import { useIsMobile } from "@/hooks/useIsMobile";

const style = {
  backgroundColor: "white",
} as const;

export default function CardCustomizationCanvas({
  cardData,
  qrProp,
  setQR,
  idProp,
  setID,
}: {
  cardData: EventCardConfigType;
  qrProp: QRProp;
  setQR: React.Dispatch<React.SetStateAction<QRProp>>;
  idProp: IDProp;
  setID: React.Dispatch<React.SetStateAction<IDProp>>;
}) {
  const isMobile = useIsMobile(640);
  const [qrChecked, setQrChecked] = useState(false);
  const [idChecked, setIdChecked] = useState(false);

  const canvasWidth = cardData?.template_layout?.card_dimension?.width || 3;
  const canvasHeight = cardData?.template_layout?.card_dimension?.height || 5;

  return (
    <div className='mt-5 p-2'>
      <div className='bg-black outline-2 outline-black/50 outline-dashed outline-offset-4 rounded-lg py-10 lg:py-16 relative overflow-hidden'>
        {/* The background that acts as the main canvas section for now */}
        <div
          style={{
            aspectRatio: `${canvasWidth} / ${canvasHeight}`,
            backgroundImage: `url(${cardData.template_url})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
          className='w-[300px] sm:w-[420px] bg-white mx-auto'
        >
          {/* QR component that gets displayed */}
          {qrChecked && (
            <Rnd
              key={`${isMobile}-qr`}
              bounds='parent'
              style={style}
              size={{width: qrProp.width, height: qrProp.height}}
              position={{ x: qrProp.x, y: qrProp.y }}
              minWidth={"75px"}
              minHeight={"75px"}
              className="qrcode bg-[url(/qr-code.png)] bg-cover bg-center"
              lockAspectRatio={1}
              // Monitor resize event
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              onResizeStop={(e, direction, ref, delta, position) => {
                // You can handle the new size and position here if needed
                setQR(prev => ({
                  ...prev,
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                }));
              }}
              onDragStop={(e, data) => {
                setQR(prev => ({
                  ...prev,
                  x: data.x,
                  y: data.y,
                }));
              }}
            />
          )}

          {/* GuestId component */}
          {idChecked && <GuestIdContainer idProp={idProp} setID={setID} />}
        </div>
        <CanvasControl
          qrChecked={qrChecked}
          setQrChecked={setQrChecked}
          idChecked={idChecked}
          setIdChecked={setIdChecked}
        />
      </div>
    </div>
  );
}
