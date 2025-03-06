import { PricingPlan, PlanType } from '@/types/home';
export const pricingPlans: Record<PlanType, PricingPlan[]> = {
    administrator: [
      {
        name: "Basic",
        price: 299,
        description: "Essential tools for small hospitals and clinics",
        features: [
          "Patient Management",
          "Staff Scheduling",
          "Basic Reporting",
          "5 User Accounts",
          "Email Support"
        ],
        missingFeatures: [
          "Advanced Analytics",
          "Inventory Management",
          "Priority Support"
        ]
      },
      {
        name: "Standard",
        price: 499,
        originalPrice: 599,
        popular: true,
        description: "Complete solution for mid-sized healthcare facilities",
        features: [
          "Everything in Basic",
          "Billing & Insurance",
          "Inventory Management",
          "15 User Accounts",
          "Phone & Email Support",
          "Custom Reports"
        ],
        missingFeatures: [
          "Advanced Analytics",
          "24/7 Priority Support"
        ]
      },
      {
        name: "Premium",
        price: 899,
        description: "Advanced features for large hospitals and healthcare networks",
        features: [
          "Everything in Standard",
          "Advanced Analytics",
          "Compliance & Security",
          "Unlimited User Accounts",
          "24/7 Priority Support",
          "Custom Integrations",
          "Dedicated Account Manager"
        ]
      }
    ],
    enterprise: [
      {
        name: "Network",
        price: 1499,
        description: "For healthcare networks with multiple locations",
        features: [
          "Multi-location Management",
          "Centralized Dashboard",
          "Advanced Analytics",
          "25 Locations",
          "100 User Accounts",
          "Priority Support"
        ],
        missingFeatures: [
          "Custom Development",
          "White-labeling"
        ]
      },
      {
        name: "Healthcare Group",
        price: 2999,
        originalPrice: 3499,
        popular: true,
        description: "Comprehensive solution for large healthcare networks",
        features: [
          "Everything in Network",
          "Unlimited Locations",
          "Unlimited Users",
          "Custom Development",
          "24/7 Dedicated Support",
          "Advanced Security Features",
          "Regular Strategy Reviews"
        ]
      },
      {
        name: "Custom",
        price: null,
        description: "Tailored solution for complex healthcare organizations",
        features: [
          "Everything in Healthcare Group",
          "Custom Development",
          "White-labeling Options",
          "On-premise Deployment Option",
          "Dedicated Development Team",
          "Executive Support"
        ],
        customPrice: true
      }
    ]
  };