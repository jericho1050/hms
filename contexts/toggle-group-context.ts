import { createContext } from 'react';
import { type VariantProps } from "class-variance-authority"

import { toggleVariants } from "@/components/ui/toggle"

export const ToggleGroupContext = createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})
