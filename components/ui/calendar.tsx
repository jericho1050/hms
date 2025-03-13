'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { CalendarProps } from '@/types/calendar';

function Calendar({
  className,
  classNames = {},
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        // Merge user-defined classNames with default
        months: cn(
          'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
          classNames.months
        ),
        month: cn('space-y-4', classNames.month),
        caption_label: cn('text-sm font-medium', classNames.caption_label),
        month_caption: cn(
          'flex justify-center pt-1 relative items-center',
          classNames.month_caption
        ),
        month_grid: cn(
          'w-full border-collapse space-y-1',
          classNames.month_grid
        ),
        weekdays: cn('flex justify-between', classNames.weekdays),
        nav: cn('space-x-1 flex items-center', classNames.nav),
        button_previous: cn('absolute left-1', classNames.button_previous),
        button_next: cn('absolute right-1', classNames.button_next),
        weekday: cn(
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
          classNames.weekday
        ),
        week: cn('flex w-full mt-2', classNames.week),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-center',
          classNames.day
        ),
        range_end: cn('day-range-end', classNames.range_end),
        selected: cn(
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
          classNames.selected
        ),
        today: cn('bg-accent text-accent-foreground', classNames.today),
        outside: cn(
          'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
          classNames.outside
        ),
        disabled: cn(
          'text-muted-foreground opacity-50',
          classNames.disabled
        ),
        range_middle: cn(
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
          classNames.range_end
        ),
        hidden: cn('invisible', classNames.hidden),
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon =
            orientation === 'left' ? ChevronLeftIcon : ChevronRightIcon;
          return <Icon className='h-4 w-4' />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
