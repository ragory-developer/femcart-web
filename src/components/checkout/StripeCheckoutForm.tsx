"use client";

import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Loader2 } from "lucide-react";

interface StripeCheckoutFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function StripeCheckoutForm({
  onSuccess,
  onError,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Confirm the payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Redirect to a dummy URL since we want to handle it natively,
        // but Stripe might force a redirect for some bank auths.
        // Usually we set redirect: 'if_required'
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
      onError(error.message || "Payment failed");
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form
      id="stripe-payment-form"
      onSubmit={handleSubmit}
      className="w-full mt-4"
    >
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <PaymentElement id="payment-element" />

        {errorMessage && (
          <div className="mt-4 p-3 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 text-sm rounded-lg font-medium">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Hidden submit button triggered by the global "Place Order" button */}
      <button
        type="submit"
        id="stripe-submit-hidden"
        className="hidden"
        disabled={isProcessing || !stripe || !elements}
      >
        Submit
      </button>

      {isProcessing && (
        <div className="mt-4 flex items-center justify-center text-blue-600 font-medium text-sm gap-2">
          <Loader2 className="animate-spin w-4 h-4" />
          Processing Payment securely with Stripe...
        </div>
      )}
    </form>
  );
}
