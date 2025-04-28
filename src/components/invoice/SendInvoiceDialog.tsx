
import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SendInvoiceDialogProps {
  defaultEmail: string;
  onSendEmail: (email: string) => Promise<void>;
  disabled?: boolean;
}

export const SendInvoiceDialog = ({ 
  defaultEmail, 
  onSendEmail,
  disabled = false 
}: SendInvoiceDialogProps) => {
  const [email, setEmail] = useState(defaultEmail);
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSend = async () => {
    if (!email || !email.includes('@')) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    
    setIsSending(true);
    setErrorMessage(null);
    try {
      await onSendEmail(email);
      setIsOpen(false);
    } catch (error: any) {
      console.error("Send invoice error:", error);
      setErrorMessage(error.message || "Failed to send the invoice. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="bg-primary hover:bg-primary/90">
          <Mail className="h-4 w-4 mr-2" />
          Send to Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Send Invoice</DialogTitle>
          <DialogDescription>
            Send the invoice to the specified email address.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="Enter email address"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSend}
            disabled={isSending}
            className="bg-primary hover:bg-primary/90"
          >
            {isSending ? "Sending..." : "Send Invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
