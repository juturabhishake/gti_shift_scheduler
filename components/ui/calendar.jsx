'use client';

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-1.5", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-3",
        month: "space-y-2",
        month_caption: "flex justify-center pt-0.5 relative items-center mb-1.5",
        caption_label: "text-xs font-semibold text-foreground",
        nav: "flex items-center gap-1",
        button_previous: cn(
          "size-6 bg-transparent p-0 opacity-70 hover:opacity-100 flex items-center justify-center rounded-md border border-border hover:bg-accent text-foreground transition-all absolute left-0"
        ),
        button_next: cn(
          "size-6 bg-transparent p-0 opacity-70 hover:opacity-100 flex items-center justify-center rounded-md border border-border hover:bg-accent text-foreground transition-all absolute right-0"
        ),
        month_grid: "w-full border-collapse space-y-0.5",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-7 font-normal text-[0.7rem] text-center",
        week: "flex w-full mt-1",
        day: "h-7 w-7 text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button: cn(
          "h-7 w-7 p-0 font-normal text-xs aria-selected:opacity-100 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground text-foreground transition-colors"
        ),
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md font-semibold",
        today: "bg-accent/80 text-accent-foreground font-bold",
        outside:
          "day-outside text-muted-foreground opacity-30 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-30 cursor-not-allowed",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") {
            return <ChevronLeft className="h-3.5 w-3.5" />;
          }
          return <ChevronRight className="h-3.5 w-3.5" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
