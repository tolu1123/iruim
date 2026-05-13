// This component is for customizing event cards.

import CardCustomizationCanvas from "@/components/event-configuration/CardCustomizationCanvas";

// It serves as a canvas for adding and configuring event cards.
export default function CardCustomizationCanvasContainer() {
  return (
    <div className='mt-5 p-5 font-lato'>
      <div className=''>
        <h3 className='font-playfair text-3xl font-bold '>Card customization canvas</h3>
        <p className=''>
          You get to customize card for your events here.
        </p>
      </div>
      {/* <CardCustomizationCanvas /> */}
    </div>
  );
}
