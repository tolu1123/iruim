"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CardCustomizationCanvas from "@/components/event-configuration/CardCustomizationCanvas";

import { EventCardConfigType } from "@/components/event-configuration/EventCardsContainer";
import { applyCardLayoutConfig } from "@/actions/manageEventConfig";

import { toast } from "sonner";

export interface QRProp {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IDProp {
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize: string;
}

import { scaleUp, scaleDown, scaleTxtUp, scaleTxtDown, getTemplateDimension, getCanvasDimension, getQRDimension, getIDDimension} from "@/lib/events/cardConfigUtils"
export default function CardConfigDialog({
  cardData,
}: {
  cardData: EventCardConfigType;
}) {
  const onMount = useRef(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isMobile = useIsMobile(640);

  const cardWithSatisfied = cardData?.template_layout?.card_dimension?.width;
  const qrConditionsSatisfied = cardData?.template_layout?.qr;
  const idConditionsSatisfied = cardData?.template_layout?.id;

  let qrPropDefault: QRProp = {
    x: 0,
    y: 100,
    width: 70,
    height: 70,
  };

  let idPropDefault: IDProp = {
    x: 0,
    y: 0,
    fontSize: "9px",
  };

  if (cardWithSatisfied && qrConditionsSatisfied && idConditionsSatisfied) {
    qrPropDefault = getQRDimension(
      cardData!.template_layout!.card_dimension!.width!,
      cardData!.template_layout!.qr!,
      isMobile,
      getCanvasDimension
    );

    idPropDefault = getIDDimension(
      cardData.template_layout!.card_dimension!.width!,
      cardData!.template_layout!.id!,
      isMobile,
      getCanvasDimension
    );

  }

  const [qrProps, setQrProps] = useState<QRProp>(qrPropDefault);
  const [idProps, setIdProps] = useState<IDProp>(idPropDefault);
 

  useEffect(() => {
    // We must distinguish the (first render) onMount from the others, these state setters
    //  must not apply when the component is just initialized
    if (onMount.current === false) {
      //eslint-disable-next-line
      setQrProps((prev) => ({
        x: isMobile ? scaleDown(prev.x) : scaleUp(prev.x),
        y: isMobile ? scaleDown(prev.y) : scaleUp(prev.y),
        width: isMobile ? scaleDown(prev.width) : scaleUp(prev.width),
        height: isMobile ? scaleDown(prev.height) : scaleUp(prev.height),
      }));

      setIdProps((prev) => ({
        x: isMobile ? scaleDown(prev.x) : scaleUp(prev.x),
        y: isMobile ? scaleDown(prev.y) : scaleUp(prev.y),
        fontSize: isMobile
          ? scaleTxtDown(prev.fontSize)
          : scaleTxtUp(prev.fontSize),
      }));
    }

    // Set onMount value to false
    onMount.current = false;
  }, [isMobile]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          className='bg-white border-green-800 hover:bg-green-800 text-green-800 hover:text-white font-lato font-semibold transition-colors duration-200 ease-linear text-wrap'
        >
          {cardData?.template_layout?.id && cardData?.template_layout?.qr? "Reconfigure template": "Configure template"}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[525px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='sr-only'>
          <DialogTitle className='font-playfair text-3xl font-bold'>
            Card customization canvas
          </DialogTitle>
          <DialogDescription>
            You get to customize card for your events here.
          </DialogDescription>
        </DialogHeader>
        <CardCustomizationCanvas
          cardData={cardData}
          qrProp={qrProps}
          setQR={setQrProps}
          idProp={idProps}
          setID={setIdProps}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline' onClick={() => {
              onMount.current = true;
            }}>Cancel</Button>
          </DialogClose>
          <Button
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                // Call server action to apply the layout config
                if (
                  cardData.template_layout?.card_dimension?.width === undefined
                ) {
                  toast.error(
                    "Card dimension data is missing. Cannot save configuration."
                  );
                  return;
                }

                const result = await applyCardLayoutConfig(
                  cardData.id,
                  {
                    qr: getQRDimension(
                      cardData.template_layout.card_dimension.width!,
                      qrProps,
                      isMobile,
                      getTemplateDimension
                    ),
                    id: getIDDimension(
                      cardData.template_layout.card_dimension.width!,
                      idProps,
                      isMobile,
                      getTemplateDimension
                    ),
                  },
                  cardData.event_id
                );

                if (result?.error) {
                  toast.error(result.message);
                  return;
                }

                toast.success("Card configuration saved successfully!");

                onMount.current = true;

                // Close the dialog
                setIsOpen(false);
                window.location.reload()
              });
            }}
          >
            {isPending ? "Saving..." : "Save configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
