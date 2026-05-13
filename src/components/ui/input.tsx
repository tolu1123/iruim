import React, { useState } from "react"

import { BsEye, BsEyeSlash } from "@/components/icons";

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}


type PasswordInputProps = React.ComponentPropsWithoutRef<"input">;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className="relative flex flex-row items-center">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          id="password"
          placeholder="Password"
          className={cn(
            "font-normal w-full py-1 rounded-md border-solid border border-input_color/10 placeholder:text-deep_text/50 block focus:border-dark_olive focus:border-2 focus:outline-none px-3",
            className
          )}
          ref={ref}
          {...props}
        />
        <div
          className="absolute right-5"
          onClick={() => setShowPassword((prevState) => !prevState)}
        >
          {showPassword ? <BsEye className="text-light-grey" /> : <BsEyeSlash className="text-light-grey" />}
        </div>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { Input, PasswordInput }
