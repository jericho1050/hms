
import { FormFieldContextValue, FormItemContextValue } from './../types/form';
import { createContext } from "react"
export const FormFieldContext = createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

export const FormItemContext = createContext<FormItemContextValue>(
  {} as FormItemContextValue
);