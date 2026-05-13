"use client";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, PasswordInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { z } from "zod";
import createUser from "@/actions/createUser";
import { CreateAdminSchema } from "@/lib/users/definitions";

export type CreateAdminState = {
  success?: boolean | null | undefined;
  error?: boolean | null | undefined;
  message?: string | null;
  errors?: z.inferFlattenedErrors<typeof CreateAdminSchema>["fieldErrors"];
};

export default function CreateUserForm({ className, setOpen, ...props }: {className?: string, setOpen?: (open: boolean) => void}) {
  const [state, action, pending] = useActionState<CreateAdminState>(createUser as unknown as (state: CreateAdminState) => Promise<CreateAdminState>, { 
    success: false,
    error: false,
    message: null,
    errors: {},
  });

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message, {
        classNames: {
          toast: "!text-green-700",
          title: "!text-green-700",
          description: "!text-green-700",
        },
      });

      if (setOpen) {
        setOpen(false);   
      }
    }

    if (state?.error) {
      toast.error(state.message, {
        classNames: {
          toast: "!text-red-500",
          title: "!text-red-500",
          description: "!text-red-500",
        },
      });
    }
  }, [state, setOpen]);

  return (
    <form
      action={action}
      className={cn(
        "flex flex-col gap-6 w-full max-w-sm p-10 border rounded-lg shadow-md",
        className
      )}
      {...props}
    >
      <div className='flex flex-col items-center gap-2 text-center'>
        <h1 className='text-2xl font-bold'>Create New Admins</h1>
        <p className='text-balance text-sm text-muted-foreground'>
          Create new admin account
        </p>
      </div>
      <div className='grid gap-6'>
        <div className='gap-1'>
          <div className='grid gap-2'>
            <Label htmlFor='username'>Username</Label>
            <Input
              name='username'
              id='username'
              type='text'
              placeholder='ToluDev'
            />
          </div>
          {state?.errors?.username && (
            <p className='text-red-600'>{state.errors.username}</p>
          )}
        </div>
        <div className='gap-1'>
          <div className='grid gap-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              name='email'
              id='email'
              type='email'
              placeholder='m@mail.com'
            />
          </div>
          {state?.errors?.email && (
            <p className='text-red-600'>{state.errors.email}</p>
          )}
        </div>

        <div className='gap-1'>
          <div className='grid gap-2'>
            <Label htmlFor='password'>Password</Label>
            <PasswordInput placeholder='Min. 8 characters' className='' />
          </div>
          {state?.errors?.password && (
            <div className='text-red-600'>
              <p>Password must:</p>
              <ul>
                {state.errors.password.map((error) => (
                  <li key={error}>- {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className='gap-1 w-full'>
          <div className='grid gap-2 w-full'>
            <Label htmlFor='role'>Role</Label>
            <Select
              name='role'
              defaultValue='Manager'
            >
              <SelectTrigger id="role" className='w-full'>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                <SelectLabel>Roles</SelectLabel>
                <SelectItem value='Admin'>Admin</SelectItem>
                <SelectItem value='Manager'>Manager</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {state?.errors?.role && (
            <p className='text-red-600'>{state.errors.role}</p>
          )}
        </div>
        <Button disabled={pending} type='submit' className='w-full'>
          {pending ? "Creating..." : "Create new admin"}
        </Button>
      </div>
    </form>
  );
}
