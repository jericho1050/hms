export interface PricingPlan {
  name: string
  price: number | null
  description: string
  features: string[]
  missingFeatures?: string[]
  originalPrice?: number
  popular?: boolean
  customPrice?: boolean
}
export type PlanType = "administrator" | "enterprise";