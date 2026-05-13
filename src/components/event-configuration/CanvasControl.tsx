import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Rnd } from "react-rnd";

interface CanvasControlProps {
  qrChecked: boolean;
  setQrChecked: (checked: boolean) => void;
  idChecked: boolean;
  setIdChecked: (checked: boolean) => void;
}
export default function CanvasControl({
  qrChecked,
  setQrChecked,
  idChecked,
  setIdChecked,
}: CanvasControlProps) {
  return (
    <Rnd bounds="parent" minWidth={120} minHeight={120}>
      <div className='bg-white/50 text-black p-5 rounded-lg'>
        <div className='flex items-center space-x-2 mb-3'>
          <Switch
            id='QR switch'
            checked={qrChecked}
            onCheckedChange={setQrChecked}
          />
          <Label htmlFor='QR switch'>QR switch</Label>
        </div>
        <div className='flex items-center space-x-2'>
          <Switch
            id='Id switch'
            checked={idChecked}
            onCheckedChange={setIdChecked}
          />
          <Label htmlFor='Id switch'>Id switch</Label>
        </div>
      </div>
    </Rnd>
  );
}
