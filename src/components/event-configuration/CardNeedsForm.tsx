import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addCardNeed } from "@/actions/manageEventConfig";

const formSchema = z.object({
  cardNeed: z
    .string()
    .min(2, "Card need must be at least 2 characters")
    .max(32, "Card need must be at most 16 characters"),
});

export default function CardNeedsForm({
  cardId,
  eventId,
  appliesToPlusOne
}: {
  cardId: string;
  eventId: string;
  appliesToPlusOne: boolean
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardNeed: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    // Call the server action to add the card need
    const result = await addCardNeed(cardId, data.cardNeed, eventId, appliesToPlusOne);
    if (result?.error) {
      toast.error(result.message);
      return;
    }

    toast.success(`Card Need "${data.cardNeed}" created successfully!`);
    form.reset();
  }

  return (
    <div className='flex flex-col items-end justify-center gap-5 '>
      <form
        id={`form-card-need-${cardId}`}
        className='w-full'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup className='mt-4'>
          <Controller
            name='cardNeed'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  htmlFor={`form-card-need-${cardId}`}
                  className='font-bold'
                >
                  Enter Card Need:
                </FieldLabel>
                <Input
                  {...field}
                  id={`form-card-need-${cardId}`}
                  aria-invalid={fieldState.invalid}
                  placeholder='Enter card need'
                  autoComplete='off'
                />
                <FieldDescription>
                  A card need is one of the purpose that the card will fulfill
                  for an attendee. For example, &lsquo;checked_in&rsquo; can be
                  a card need that indicates whether an attendee has checked in
                  to the event, we could also have
                  &lsquo;souvenir_collected&rsquo; which indicates whether an
                  attendee has collected a souvenir.
                  <span className='text-destructive'>
                    It must be question like and must be in lower case, joined
                    by underscores(_). And it must not contain <b>&quot;name&quot;</b> string.
                  </span>
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
      <Button
        form={`form-card-need-${cardId}`}
        type='submit'
        className='px-4 py-1.5'
      >
        Add card need
      </Button>
    </div>
  );
}
