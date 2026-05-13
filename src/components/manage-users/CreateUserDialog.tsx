"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateUserForm from "@/components/manage-users/CreateUserForm";

function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="lg:hidden">Create Admin/Manager</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="sr-only">Create User</DialogTitle>
          <DialogDescription className="sr-only">
            Form to create a new user, whether admin or manager.
          </DialogDescription>
          <CreateUserForm setOpen={setOpen} />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default CreateUserDialog;
