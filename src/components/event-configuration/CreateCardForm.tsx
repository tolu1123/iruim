"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import { createEventIv } from "@/actions/manageEventConfig";

const formSchema = z.object({
  cardName: z
    .string()
    .min(2, "Card name must be at least 2 characters")
    .max(32, "Card name must be at most 32 characters"),
  applyToPlusOne: z.boolean()
});

export default function CreateCardForm({ eventId, eventHasPlusOne }: { eventId: string, eventHasPlusOne: boolean }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardName: "",
      applyToPlusOne: false
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const result = await createEventIv(eventId, data.cardName, data.applyToPlusOne);

    if (result?.error) {
      toast.error(result.message);
      return;
    }

    toast.success(`Event Card "${data.cardName}" created successfully!`);
    form.reset();
  }

  return (
    <div className='mt-5 p-5 border border-black/50 rounded-lg font-lato'>
      <div className=''>
        <h3 className='font-playfair text-3xl font-bold '>
          Add Card to configure
        </h3>
        <p className=''>Add name of the card you want to add</p>
      </div>

      <div className='flex flex-col items-end justify-center gap-5 '>
        <form
          id='form-create-card'
          className='w-full'
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup className='mt-4'>
            <Controller
              name='cardName'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='form-cardName'>Card Name</FieldLabel>
                  <Input
                    {...field}
                    id='form-cardName'
                    aria-invalid={fieldState.invalid}
                    placeholder='Enter card name'
                    autoComplete='off'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {eventHasPlusOne && <Controller
              name='applyToPlusOne'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="" orientation="horizontal"  data-invalid={fieldState.invalid}>
                  <Checkbox
                    id='form-apply-to-plus-one'
                    aria-invalid={fieldState.invalid}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className='size-6'
                  />
                  <FieldLabel htmlFor='form-apply-to-plus-one' className="gap-0!"><span className="text-destructive text-xl">*</span>Apply to Plus One</FieldLabel>
                </Field>
              )}
            />}

          </FieldGroup>
        </form>
        <Button form='form-create-card' type='submit' className='w-full sm:w-48 h-10'>
          Create Card
        </Button>
      </div>
    </div>
  );
}
