"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import { useAuthStore } from "@/lib/store/auth-store";
import { Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OrderStatusUpdate({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [carrier, setCarrier] = useState("Certis Lanka Courier");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [showShippingModal, setShowShippingModal] = useState(false);

  const handleUpdate = async (overrideStatus?: string, customDetails?: { carrier?: string; trackingNumber?: string }) => {
    const targetStatus = overrideStatus || status;
    const token = useAuthStore.getState().token;

    if (targetStatus === "shipped" && !customDetails && !showShippingModal) {
      setShowShippingModal(true);
      return;
    }

    setIsPending(true);
    try {
      const details = customDetails || (targetStatus === "shipped" ? { carrier, trackingNumber } : {});
      const result = await updateOrderStatus(orderId, targetStatus, details, token);
      if (result.success) {
        toast.success(`Order marked as ${targetStatus}! Customer notification sent.`);
        setStatus(targetStatus);
        setShowShippingModal(false);
      } else {
        toast.error("Failed to update status", { description: result.error });
      }
    } catch {
      toast.error("An unexpected error occurred while updating status");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Update Status:</span>
        <div className="relative inline-flex items-center">
          <select
            disabled={isPending}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none rounded-md bg-muted/50 px-4 py-2 pr-10 text-sm font-medium border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors cursor-pointer w-40 capitalize"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="pointer-events-none absolute right-3 flex items-center justify-center">
            <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
        <Button 
          onClick={() => handleUpdate()} 
          disabled={isPending || status === currentStatus}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 rounded-md"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
        </Button>
      </div>

      {showShippingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border/50 rounded-2xl p-6 shadow-2xl glass-card space-y-5">
            <div className="flex items-center gap-3 text-purple-600">
              <Truck className="h-6 w-6" />
              <h3 className="text-xl font-bold">Courier Shipping Details</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Entering the tracking number will automatically email the customer with live dispatch updates.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="carrier">Courier Carrier</Label>
                <Input
                  id="carrier"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g., Certis Lanka, PromptX, DHL"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trackingNumber">Tracking Number / Consignment #</Label>
                <Input
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g., CR-89472910"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowShippingModal(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdate("shipped", { carrier, trackingNumber: trackingNumber || `TRK-${Date.now()}` })}
                disabled={isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Dispatch & Email Customer
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
