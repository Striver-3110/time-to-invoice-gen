
import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Banknote } from "lucide-react";

interface PaymentDialogProps {
  invoiceId: string;
  onPaymentSubmit: (paymentDate: Date) => Promise<void>;
}

export const PaymentDialog = ({ invoiceId, onPaymentSubmit }: PaymentDialogProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!date) return;
    setIsSubmitting(true);
    try {
      await onPaymentSubmit(date);
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Banknote className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Mark Invoice as Paid</DialogTitle>
          <DialogDescription>
            Select the date when the payment was received.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
            className="mx-auto"
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!date || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Saving..." : "Save Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
