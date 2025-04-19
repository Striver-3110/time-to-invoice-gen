
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface BillingPeriodSelectorProps {
  billingStart: Date;
  billingEnd: Date;
  dueDate: Date;
  setBillingStart: (date: Date) => void;
  setBillingEnd: (date: Date) => void;
  setDueDate: (date: Date) => void;
}

export const BillingPeriodSelector = ({
  billingStart,
  billingEnd,
  dueDate,
  setBillingStart,
  setBillingEnd,
  setDueDate
}: BillingPeriodSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label>Billing Period Start</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !billingStart && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {billingStart ? format(billingStart, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={billingStart}
              onSelect={(date) => date && setBillingStart(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div>
        <Label>Billing Period End</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !billingEnd && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {billingEnd ? format(billingEnd, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={billingEnd}
              onSelect={(date) => date && setBillingEnd(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div>
        <Label>Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={(date) => date && setDueDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
