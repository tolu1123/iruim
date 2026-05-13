"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const eventSchema = z.object({
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
  .union([z.url("Enter a valid google map link for the location"), z.literal("")])
  .optional(),
  registrationLink: z.url("Enter a valid registration link."),
  sheetLink: z.url("Enter a valid sheet link."),
  image: z.url("Enter a valid image URL."),
});

export default async function createEvents(formData: z.infer<typeof eventSchema>) {
  const supabase = await createClient();

  const { title, date, time, location, locationUrl, shortDescription, description, registrationLink, sheetLink, image } = formData;


  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData?.user) {
    redirect("/sign-in");
  }

   const { error: EventsError } = await supabase.from("events").insert([
    {
      title,
      shortDescription,
      description,
      date,
      time,
      location,
      locationUrl,
      registrationLink,
      sheetLink,
      imageUrl: image,
    },
  ]);

  if (EventsError) {
    return {
      success: false,
    };
  }
  revalidatePath("/(admin)/list-events");

  return {
    success: true
  }
}


export async function editEvent(id: string, formData: z.infer<typeof eventSchema>) {
  const supabase = await createClient();

  const parsed = eventSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
    };
  }

  const { title, date, time, location, locationUrl, shortDescription, description, registrationLink, sheetLink, image } = parsed.data;


  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData?.user) {
    redirect("/sign-in");
  }

   const { error: EventsError } = await supabase.from("events").update(
    {
      title,
      shortDescription,
      description,
      date,
      time,
      location,
      locationUrl,
      registrationLink,
      sheetLink,
      imageUrl: image,
    })
    .eq('id', id);

  if (EventsError) {
    return {
      success: false,
    };
  }
  revalidatePath("/(admin)/list-events");

  return {
    success: true
  }
}

export async function getEvents() {
  const supabase = await createClient();

  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData?.user) {
    redirect("/sign-in");
  }

  const { data, error: EventsError } = await supabase
    .from("events")
    .select("*")
    
  if (EventsError) {
    redirect("/error");
  }

  return data;
}