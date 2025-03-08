import { VariantProps } from 'class-variance-authority';
import { SheetPrimitive, type sheetVariants } from "@/components/ui/sheet";

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}