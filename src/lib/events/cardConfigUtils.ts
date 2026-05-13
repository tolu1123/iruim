import { QRProp, IDProp } from "@/components/event-configuration/CardConfigDialog";

type CallFn = (x: number, y: number, z: boolean) => number;

// This scaleUp and down functions help to scale the position and size values
// when switching between mobile and desktop views in the card customization canvas.

// For context: the ratio=> 1.4 or 5/7 is stemmed from the fact that the canvas has
// a width of 300 on mobile and a width of 420 on larger screens
const scaleUp = (s: string | number, suffix?: string): number => {
  return Math.ceil(parseInt(s.toString()) * 1.4);
};

const scaleDown = (s: string | number, suffix?: string): number => {
  return Math.ceil((parseInt(s.toString()) * 5) / 7);
};

const scaleTxtUp = (s: string): string => {
  return Math.ceil(parseInt(s) * 1.4) + "px";
};
const scaleTxtDown = (s: string): string => {
  return Math.ceil((parseInt(s) * 5) / 7) + "px";
};

// Function to get direct scaling based on the template dimension ratio
// for upload back to the server, used to express client canvas dimensions in the corresponding
// template dimension, since the template was possibly scaled up/down due to its
// large or extremely small size.
const getTemplateDimension = (
  canvasDimension: number,
  dimension: number,
  isMobile: boolean
): number => {
  if (isMobile) {
    return Math.ceil((canvasDimension * dimension) / 300);
  }
  return Math.ceil((canvasDimension * dimension) / 420);
};

// When we upload and we want to display back the uploaded image
const getCanvasDimension = (
  canvasDimension: number,
  val: number,
  isMobile: boolean
): number => {
  if (isMobile) {
    return Math.ceil((val * 300) / canvasDimension);
  }
  return Math.ceil(val * 420) / canvasDimension;
};

const getQRDimension = (
  canvasDimension: number,
  qrProp: QRProp,
  isMobile: boolean,
  callFn: CallFn
): QRProp => {
  for (const [key, value] of Object.entries(qrProp)) {
    if (key === "x" || key === "y" || key === "width" || key === "height") {
      qrProp[key] = callFn(canvasDimension, value, isMobile);
    }
  }
  return qrProp;
};

const getIDDimension = (
  canvasDimension: number,
  idProp: IDProp,
  isMobile: boolean,
  callFn: CallFn
): IDProp => {
  for (const [key, value] of Object.entries(idProp)) {
    if (key === "x" || key === "y") {
      idProp[key] = callFn(canvasDimension, value, isMobile);
    } else if (key === "fontSize") {
      idProp[key] = `${callFn(canvasDimension, Math.ceil(parseInt(value)), isMobile)}px`;
    }
  }
  return idProp;
};

export { scaleUp, scaleDown, scaleTxtUp, scaleTxtDown, getTemplateDimension, getCanvasDimension, getQRDimension, getIDDimension};