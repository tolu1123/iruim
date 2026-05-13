"use client";

import * as React from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import createEvents from "@/actions/events";
import MyDropzone from "@/components/universal/MyDropzone";
import { v4 as uuidv4 } from "uuid";

import { createClient } from "@/lib/supabase/client";

export const eventSchema = z.object({
  title: z
    .string()
    .min(3, "Event title must be at least 3 characters.")
    .max(100, "Event title must be less than 100 characters."),
  shortDescription: z
    .string()
    .min(3, "Event short description must be at least 3 characters.")
    .max(50, "Event short description must be less than 100 characters."),
  description: z
    .string()
    .min(20, "Event description must be at least 20 characters.")
    .max(3000, "Event description must be less than 500 characters."),
  date: z.date({ error: "Event date is required." }),
  time: z
    .string()
    .min(1, "Event time is required.")
    .regex(/^([0-1]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, "Invalid time format"),
  location: z
    .string()
    .min(3, "Event location must be at least 3 characters.")
    .max(200, "Event location must be less than 200 characters."),
  locationUrl: z
    .union([
      z.url("Enter a valid google map link for the location"),
      z.literal(""),
    ])
    .optional(),
  registrationLink: z.url("Enter a valid registration link."),
  sheetLink: z.url("Enter a valid sheet link."),
  image: z.any(),
});

export type EventFormValues = z.infer<typeof eventSchema>;

export default function CreateEventForm() {
  const supabase = createClient();
  const router = useRouter();

  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      description: "",
      date: undefined,
      time: "",
      location: "",
      locationUrl: "",
      registrationLink: "",
      sheetLink: "",
      image: [],
    },
  });

  async function onSubmit(data: EventFormValues) {
    // Here what i want to do is send the file i got here to supabase and get the generated Url
    const files = data.image;
    // If no files are uploaded, we show a toast and return early
    // This is to ensure that the user uploads at least one image for the event
    if (files.length === 0) {
      toast.error("Please upload at least an image of the event", {
        classNames: {
          toast: "!text-red-500",
          title: "!text-red-500",
          description: "!text-red-500",
        },
      });
      return;
    }

    // Create a unique name for the file to be stored
    const uniqueIdentifier = uuidv4();
    const fileName = files[0].name;
    const fileType = files[0].type;

    // A check to ensure only images are accepted
    if (!fileType.startsWith("image/")) {
      toast.error("Only image files are allowed.");
    }
    // Stripping file extension and ensuring extension exists
    const dotIndex = fileName.lastIndexOf(".");
    if (dotIndex === -1) {
      toast.error("File name must have an extension.");
      return;
    }
    if (fileName.length < dotIndex + 2) {
      toast.error("File name must have a valid extension.");
    }
    const fileExtension = fileName.slice(dotIndex + 1).toLowerCase();

    // Construct unique filename
    const filePath = `${uniqueIdentifier}.${fileExtension}`;
    const { error: fileStorageError } = await supabase.storage
      .from("event-images")
      .upload(filePath, files[0], {
        upsert: true,
      });

    if (fileStorageError) {
      toast.error(`Failed to upload IV: ${fileStorageError}`);
      return;
    }

    const eventUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event-images/${filePath}`;

    data.image = eventUrl;

    const res = await createEvents(data!);
    if (!res.success) {
      toast.error("Failed to create event.");
      return;
    }

    toast("Event Created Successfully 🎉", {
      description: (
        <pre className='bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4'>
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
    });
    form.reset();
    router.push("/list-events");
  }

  return (
    <section className=''>
      <div className='w-full xl:max-w-[1140px] mx-auto px-5 py-5 md:pt-5 md:pb-20'>
        <div className='mb-8'>
          <h2 className='font-playfair font-bold text-2xl sm:text-3xl'>
            Create New Event
          </h2>
          <p className='text-xl'>Fill out the form below to create an event.</p>
        </div>

        <form id='event-form' onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className='grid grid-cols-1 sm:grid-cols-2'>
            {/* Event Image URL */}
            <Controller
              name='image'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className='col-span-1 sm:col-span-2'
                >
                  <FieldLabel htmlFor='event-image'>Event Image URL</FieldLabel>
                  <MyDropzone value={field.value} onChange={field.onChange} />
                  <FieldDescription>
                    Use a high-resolution, high-quality image that clearly
                    represents your event. Landscape orientation is preferred.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Event Title */}
            <Controller
              name='title'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='event-title'>Event Title</FieldLabel>
                  <Input
                    {...field}
                    id='event-title'
                    placeholder='e.g. Golfers Conference 2025'
                    autoComplete='off'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Event ShortDescription */}
            <Controller
              name='shortDescription'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='event-short-description'>
                    Event Short description
                  </FieldLabel>
                  <Input
                    {...field}
                    id='event-short-description'
                    placeholder='e.g. A nice conference for golfers'
                    autoComplete='off'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Event Description */}
            <Controller
              name='description'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className='col-span-1 sm:col-span-2'
                >
                  <FieldLabel htmlFor='event-description'>
                    Event Description
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id='event-description'
                      placeholder='Describe the event purpose, audience, and highlights.'
                      rows={5}
                      className='min-h-24 resize-none'
                    />
                    <InputGroupAddon align='block-end'>
                      <InputGroupText className='tabular-nums'>
                        {field.value.length}/3000 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    Give attendees a reason to show up!
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Event Date and Time Picker */}
            <div className='flex flex-col gap-4'>
              <div className='flex gap-4'>
                {/* Date Picker */}
                <Controller
                  name='date'
                  control={form.control}
                  render={({ field, fieldState }) => {
                    const selectedDate = field.value
                      ? new Date(field.value)
                      : undefined;

                    return (
                      <Field
                        data-invalid={fieldState.invalid}
                        className='flex-1'
                      >
                        <Label htmlFor='date-picker' className='px-1'>
                          Date
                        </Label>
                        <Popover
                          open={popoverOpen}
                          onOpenChange={setPopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant='outline'
                              id='date-picker'
                              className='w-full justify-between font-normal'
                            >
                              {selectedDate
                                ? selectedDate.toLocaleDateString()
                                : "Select date"}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className='w-auto overflow-hidden p-0'
                            align='start'
                          >
                            <Calendar
                              mode='single'
                              selected={selectedDate}
                              captionLayout='dropdown'
                              onSelect={(date) => {
                                field.onChange(date);
                                setPopoverOpen(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    );
                  }}
                />

                {/* Time Picker */}
                <Controller
                  name='time'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className='flex-1'>
                      <Label htmlFor='time-picker' className='px-1'>
                        Time
                      </Label>
                      <Input
                        {...field}
                        type='time'
                        id='time-picker'
                        step='60'
                        className='bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>

            {/* Event Location */}
            <Controller
              name='location'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='event-location'>
                    Event Location (Address)
                  </FieldLabel>
                  <Input
                    {...field}
                    id='event-location'
                    placeholder='e.g. 123 Main Street, Ibadan'
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Event Location Link */}
            <Controller
              name='locationUrl'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='event-locationurl'>
                    Event Location Url
                  </FieldLabel>
                  <Input
                    {...field}
                    id='event-locationurl'
                    placeholder='https://maps.app.goo.gl'
                  />
                  <FieldDescription>
                    Provide the google map link for attendees.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Registration Link */}
            <Controller
              name='registrationLink'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='event-registration'>
                    Event Registration Link
                  </FieldLabel>
                  <Input
                    {...field}
                    id='event-registration'
                    placeholder='https://example.com/register'
                  />
                  <FieldDescription>
                    Provide the public link where attendees can register.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Google Sheet Link */}
            <Controller
              name='sheetLink'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='event-sheet-link'>
                    Event Sheet Link
                  </FieldLabel>
                  <Input
                    {...field}
                    id='event-sheet-link'
                    placeholder='https://example.com/register'
                  />
                  <FieldDescription>
                    Provide the google sheet link of the form. Add this{" "}
                    <b className='text-green-900'>
                      event-sync-bot@platinum24-477411.iam.gserviceaccount.com
                    </b>{" "}
                    to the google sheet and give it Editor permission.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div className='mt-10 flex justify-center items-center'>
            <Button type='submit' form='event-form' className='w-full sm:w-3/4'>
              Create Event
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
