// This is not a product card, this card displays the card needs and
// configurations for the card (the needs the card fulfills) if any.

// This card also has an input for adding new needs to the card.
//with a button to add the need to the card.
// It also has buttons to upload card template and to configure the card.
"use client";

import { useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import CardNeedsForm from "@/components/event-configuration/CardNeedsForm";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CardConfigDialog from "@/components/event-configuration/CardConfigDialog";

import { EventCardConfigType } from "@/components/event-configuration/EventCardsContainer";
import { deleteCardNeed } from "@/actions/manageEventConfig";
import { toast } from "sonner";
import UploadTemplateButton from "@/components/event-configuration/UploadTemplateButton";

export default function EventCard({
  cardData,
}: {
  cardData: EventCardConfigType;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardData.name}</CardTitle>
        <CardDescription>
          This card named &lsquo;{cardData.name}&rsquo; is used to manage access
          permissions for event attendees. You can specify the needs that this
          card fulfills, upload a card template, and configure the card
          settings.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className=''>
          <h6 className='font-semibold'>Card Needs</h6>
          <ul className='divide-y divide-gray-200'>
            {cardData.needs && cardData.needs.length > 0 ? (
              cardData.needs.map(need => (
                <li key={need.id} className='flex items-center justify-between py-1'>
                  <span>{need.name}</span>
                  <DeleteNeedAlert needId={need.id} cardNeed={need.name} eventId={cardData.event_id} cardId={cardData.id} role='Admin' />
                </li>
              ))
            ) : (
              <p className='text-center py-5'>No card needs added yet.</p>
            )}
          </ul>
        </div>
        <CardNeedsForm eventId={cardData.event_id} cardId={cardData.id} appliesToPlusOne={cardData.applies_to_plus_one} />
      </CardContent>
      <Separator className='my-4' />
      <CardFooter className='grid grid-cols-2 gap-5'>
        <UploadTemplateButton cardId={cardData.id} eventId={cardData.event_id} templateUrl={cardData.template_url} />
        <CardConfigDialog cardData={cardData} />
      </CardFooter>
    </Card>
  );
}

function DeleteNeedAlert({
  cardNeed,
  needId,
  eventId,
  role,
  cardId,
}: {
  cardNeed: string;
  needId: string;
  eventId: string;
  role: string;
  cardId: string;
}) {
  const [isPending, startTransition] = useTransition();
  function handleDelete() {
    // Handle delete logic here
    startTransition(async () => {
      const result = await deleteCardNeed(needId, eventId, cardNeed, cardId);
      if (result?.error) {
        toast.error(result.message);
        return;
      }

      toast.success(`Card Need "${cardNeed}" deleted successfully!`);
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant='destructive'
          size='icon'
          disabled={role !== "Admin" || isPending}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {cardNeed}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will delete the card need from the event card.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleDelete()}
            disabled={isPending}
            asChild
          >
            <Button variant='destructive'>
              {isPending ? (
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
              ) : null}
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
