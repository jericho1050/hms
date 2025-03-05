import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HospitalIcon, ClipboardList, Calendar, Users, ShieldCheck } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Next-Gen Hospital Management System</h1>
            <p className="text-xl mb-8">
              Streamlining healthcare operations with modern technology for better patient care
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Link href="/dashboard">Access Dashboard</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white/10"
              >
                <Link href="/auth/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<ClipboardList className="h-10 w-10 text-blue-500" />}
              title="Patient Management"
              description="Comprehensive patient records, history tracking, and demographic management"
            />
            <FeatureCard
              icon={<Calendar className="h-10 w-10 text-blue-500" />}
              title="Appointment Scheduling"
              description="Efficient booking system with automated reminders and calendar integration"
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-blue-500" />}
              title="Staff Management"
              description="Scheduling, credentials, and performance tracking for all staff members"
            />
            <FeatureCard
              icon={<ShieldCheck className="h-10 w-10 text-blue-500" />}
              title="Secure & Compliant"
              description="HIPAA-compliant data storage with advanced security measures"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <HospitalIcon className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold">HMS</span>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} Hospital Management System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

