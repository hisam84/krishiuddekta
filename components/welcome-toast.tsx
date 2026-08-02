"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function WelcomeToast() {
  useEffect(() => {
    // Show toast only once per session
    if (!sessionStorage.getItem("welcome-toast-shown")) {
      toast("Welcome to Krishi Uddokta!", {
        description: "Your trusted online agro store for seeds, fertilizers, and tools.",
        duration: 5000,
      });
      sessionStorage.setItem("welcome-toast-shown", "true");
    }
  }, []);

  return null;
}
