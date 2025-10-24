import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "./dialog";
import { useState } from "react";
import { Label } from "@radix-ui/react-label";
import { ListRestartIcon } from "lucide-react";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Button } from "./button";

type Props = {
  open: boolean;
  loading?: boolean;
  onClose: (open: boolean) => void;
  onConfirm: () => void;
  message: string;
  title?: string;
};
type PropsConfirmWithReason = {
  open: boolean;
  onClose: (open: boolean) => void;
  onConfirm: (data: any) => void;
  confirmMessage: string;
  message: string;
  title?: string;
};

export const ConfirmDialog = ({
  open,
  title,
  onClose,
  loading = false,
  onConfirm,
  message,
}: Props) => {
  if (!open) return;
  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <div className="fixed inset-0 bg-blue-100/60 z-50" />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 select-none">
        <DialogContent className="max-w-lg w-full p-6 rounded-lg shadow-lg bg-red-50 border border-red-300 mx-auto my-24 flex flex-col justify-center">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-bold text-red-700">
              {title || "Are you sure?"}
            </DialogTitle>
            {message && (
              <DialogDescription className="text-sm text-red-600 mt-1">
                {message}
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              disabled={loading}
              variant="outline"
              className="border-red-500 text-red-700 hover:bg-red-100"
              onClick={() => {
                onClose(false);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={onConfirm}
            >
              {loading ? "Confirming..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export const ConfirmWithReason = ({
  open = false,
  onClose,
  message,
  title,
  onConfirm,
  confirmMessage,
}: PropsConfirmWithReason) => {
  const [reason, setReason] = useState("");
  const [userTypeConfirmMessage, setUserTypeConfirmMessage] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (userTypeConfirmMessage !== confirmMessage) {
      setError(`Please type exactly "${confirmMessage}" to confirm.`);
      return;
    }
    if (reason.length < 10) {
      setError(
        "please give reason why you this action perform and atLeast reason length is more than 10 char"
      );
      return;
    }
    onConfirm?.(reason);
    setReason("");
    setUserTypeConfirmMessage("");
    setError("");
    onClose(false);
  };
  if (!open) return null;
  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <div className="fixed inset-0 bg-blue-100/60 z-50" />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 select-none">
        <DialogContent className="max-w-lg w-full p-6 rounded-lg shadow-lg bg-red-50 border border-red-300 mx-auto my-24 flex flex-col justify-center">
          {/* Header */}
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-bold text-red-700">
              {title || "Are you sure?"}
            </DialogTitle>
            {message && (
              <DialogDescription className="text-sm text-red-600 mt-1">
                {message}
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Body */}
          <div className="mt-4 space-y-4">
            {/* Reason */}
            <div className="flex flex-col">
              <Label htmlFor="reason" className="mb-1 text-red-700">
                Reason
              </Label>
              <div className="relative">
                <ListRestartIcon className="absolute left-3 top-3 h-4 w-4 text-red-400" />
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="pl-10 border-red-300 focus:border-red-500 focus:ring-red-500"
                  placeholder="Enter reason here..."
                />
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="flex flex-col">
              <Label className="mb-1 text-red-700">
                Confirm by typing:{" "}
                <span className="font-medium">"{confirmMessage}"</span>
              </Label>
              <Input
                type="text"
                value={userTypeConfirmMessage}
                onChange={(e) => {
                  setUserTypeConfirmMessage(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Type here..."
                className={`border-red-300 focus:border-red-500 focus:ring-red-500 ${
                  error ? "border-red-500" : ""
                }`}
              />
              {error && (
                <p className="text-red-600 text-sm mt-1 font-medium">{error}</p>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              className="border-red-500 text-red-700 hover:bg-red-100"
              onClick={() => {
                setReason("");
                setUserTypeConfirmMessage("");
                setError("");
                onClose(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirm}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </div>
    </Dialog>
  );
};
