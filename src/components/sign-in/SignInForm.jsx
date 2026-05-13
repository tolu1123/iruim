"use client";

import { startTransition, useActionState, useEffect } from "react";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input, PasswordInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import signIn from "@/actions/signIn";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/\d/, { message: "Password must contain at least one number" })
});

const SignInForm = () => {
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [state, action, pending] = useActionState(signIn, undefined);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.message, {
        classNames: {
          toast: "!text-red-500",
          title: "!text-red-500",
          description: "!text-red-500",
        },
      });
    }
  }, [state]);

  async function onSubmit(formData) {
    form.reset();

    startTransition(() => {
      action(formData);
    });
  }

  return (
    <div className=''>
      <div className=''>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='mb-1'>
                    Email<b className='text-purple font-black'>*</b>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='mail@platinum24.com'
                      className='auth-input'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='mb-1'>
                    Password<b className='text-purple font-black'>*</b>
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder='Min. 8 characters'
                      className='auth-input'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              className='w-full h-[3.375rem]  rounded-[0.84125rem] lg:rounded-2xl bg-black hover:bg-black active:bg-purple/70 text-white font-dm_sans font-bold text-sm leading-[-2%] disabled:bg-black/80'
            >
              Sign In
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SignInForm;
