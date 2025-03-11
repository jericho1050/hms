'use client';
import type React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckIcon, HospitalIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { pricingPlans } from '../lib/mock-pricing';
import { PlanButton } from '@/components/ui/plan-button';
import { PricingPlan, PlanType } from '@/types/home';
import Link from 'next/link';

export default function Home() {
  const [activePlan, setActivePlan] = useState<PlanType>('administrator');

  return (
    <div className='flex flex-col min-h-screen max-w-7xl mx-auto'>
      {/* Promotion Banner */}
      {/* <div className="bg-blue-50 py-2 px-4 text-center">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <span className="bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">40% OFF</span>
          <p className="text-sm">Get up to 40% off on HMS Premium. New customers, limited time only.</p>
        </div>
      </div> */}

      {/* Hero Section */}
      <section className='container mx-auto px-4 py-16 md:py-24'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          <div className='space-y-8'>
            <h1 className='text-5xl md:text-6xl font-bold tracking-tight'>
              Find the right plan for{' '}
              <span className='bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600'>
                your hospital
              </span>
              .
            </h1>
            <p className='text-xl text-muted-foreground max-w-[600px]'>
              Streamline your healthcare operations with our comprehensive
              hospital management system. Try for 30 days with our money-back
              guarantee.
            </p>
            <div className='space-y-4 space-x-4'>
              <Button size='lg' className='h-12 px-7'>
                Schedule a demo
              </Button>
              <Button size='lg' className='h-12 px-7' variant='outline' asChild>
                <Link href='/dashboard'>Access Dashboard</Link>
              </Button>
              <p className='text-sm text-muted-foreground'>
                Starting at{' '}
                <span className='font-bold text-foreground'>$299/month</span>{' '}
                <span className='inline-flex items-center'>
                  <span className='line-through text-muted-foreground mr-2'>
                    $399
                  </span>
                  <span className='bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium'>
                    25% OFF
                  </span>
                </span>
              </p>
            </div>
          </div>
          <div className='relative'>
            <div className='relative z-10'>
              <Image
                src='dashboard.jpg'
                width={800}
                height={600}
                alt='HMS Dashboard Preview'
                className='rounded-lg shadow-2xl h-[600px] w-[800px] object-cover'
              />
              {/* Mobile preview overlay */}
              <div className='absolute -left-12 bottom-0 w-64'>
                <Image
                  src='hospital.jpeg'
                  width={250}
                  height={500}
                  alt='HMS Mobile Preview'
                  className='rounded-lg shadow-2xl h-[500px] w-[250px]'
                />
              </div>
            </div>
            {/* Background decoration */}
            <div className='absolute inset-0 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-3xl blur-3xl' />
          </div>
        </div>
      </section>

      {/* Plan Toggle */}
      <section className='container mx-auto px-4 pb-16'>
        <div className='flex justify-center'>
          <div className='inline-flex rounded-lg border p-1 bg-muted/50'>
            <PlanButton
              active={activePlan === 'administrator'}
              onClick={() => setActivePlan('administrator')}
            >
              Administrator
            </PlanButton>
            <PlanButton
              active={activePlan === 'enterprise'}
              onClick={() => setActivePlan('enterprise')}
            >
              Enterprise
            </PlanButton>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className='grid md:grid-cols-3 gap-8 mt-12'>
          {pricingPlans[activePlan].map((plan: PricingPlan, index: number) => (
            <div
              key={index}
              className={cn(
                'rounded-xl border bg-card overflow-hidden transition-all',
                plan.popular
                  ? 'ring-2 ring-primary shadow-lg scale-105'
                  : 'hover:shadow-md'
              )}
            >
              {plan.popular && (
                <div className='bg-primary py-1 text-center'>
                  <span className='text-xs text-primary-foreground font-medium'>
                    MOST POPULAR
                  </span>
                </div>
              )}
              <div className='p-6'>
                <h3 className='font-semibold text-lg'>{plan.name}</h3>
                <div className='mt-4 flex items-baseline'>
                  <span className='text-3xl font-bold'>${plan.price}</span>
                  <span className='text-sm text-muted-foreground ml-2'>
                    /month
                  </span>
                </div>
                {plan.originalPrice && (
                  <div className='mt-1 flex items-center'>
                    <span className='line-through text-sm text-muted-foreground'>
                      ${plan.originalPrice}
                    </span>
                    <span className='ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium'>
                      {Math.round(
                        (1 - plan.originalPrice / plan.originalPrice) * 100
                      )}
                      % OFF
                    </span>
                  </div>
                )}
                <p className='text-sm text-muted-foreground mt-3'>
                  {plan.description}
                </p>
                <Button
                  className={cn(
                    'w-full mt-6',
                    plan.popular ? '' : 'variant-outline'
                  )}
                >
                  {plan.popular ? 'Get Started' : 'Choose Plan'}
                </Button>
              </div>
              <div className='border-t p-6'>
                <h4 className='font-medium text-sm mb-4'>Includes:</h4>
                <ul className='space-y-3'>
                  {plan.features.map((feature, i) => (
                    <li key={i} className='flex text-sm'>
                      <CheckIcon className='h-5 w-5 text-green-500 mr-3 flex-shrink-0' />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.missingFeatures?.map((feature, i) => (
                    <li key={i} className='flex text-sm text-muted-foreground'>
                      <XIcon className='h-5 w-5 text-muted-foreground/70 mr-3 flex-shrink-0' />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className='container mx-auto px-4 py-16 border-t'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold mb-4'>
            Everything you need to manage your hospital
          </h2>
          <p className='text-muted-foreground'>
            Comprehensive tools and features designed specifically for
            healthcare providers
          </p>
        </div>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {features.map((feature, index) => (
            <div
              key={index}
              className='p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow'
            >
              <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4'>
                {feature.icon}
              </div>
              <h3 className='text-xl font-semibold mb-2'>{feature.title}</h3>
              <p className='text-muted-foreground'>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className='mt-auto bg-muted/30 border-t'>
        <div className='container mx-auto px-4 py-8'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <div className='flex items-center mb-4 md:mb-0'>
              <HospitalIcon className='h-8 w-8 text-primary mr-2' />
              <span className='text-xl font-bold'>CareSanar</span>
            </div>
            <div className='text-sm text-muted-foreground'>
              © {new Date().getFullYear()} Hospital Management System. All
              rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: <HospitalIcon className='h-6 w-6 text-primary' />,
    title: 'Patient Management',
    description:
      'Efficiently manage patient records, appointments, and medical histories in one place.',
  },
  {
    icon: <HospitalIcon className='h-6 w-6 text-primary' />,
    title: 'Staff Scheduling',
    description:
      'Optimize staff schedules and manage shifts with our intuitive scheduling system.',
  },
  {
    icon: <HospitalIcon className='h-6 w-6 text-primary' />,
    title: 'Billing & Insurance',
    description:
      'Streamline billing processes and handle insurance claims with automated workflows.',
  },
  {
    icon: <HospitalIcon className='h-6 w-6 text-primary' />,
    title: 'Inventory Management',
    description:
      'Track medical supplies and equipment with real-time inventory monitoring.',
  },
  {
    icon: <HospitalIcon className='h-6 w-6 text-primary' />,
    title: 'Analytics & Reports',
    description:
      "Generate detailed reports and gain insights into your hospital's performance.",
  },
  {
    icon: <HospitalIcon className='h-6 w-6 text-primary' />,
    title: 'Compliance & Security',
    description:
      'Stay compliant with healthcare regulations and protect sensitive patient data.',
  },
];
