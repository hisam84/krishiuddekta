"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function WelcomeToast() {
  useEffect(() => {
    // ignore if screen height is too small
    if (window.innerHeight < 650) return;
    if (!document.cookie.includes("welcome-toast=2")) {
      toast("🌱 কৃষি উদ্যোক্তা-তে স্বাগতম!", {
        id: "welcome-toast",
        duration: 5000,
        onDismiss: () => {
          document.cookie = "welcome-toast=2; max-age=31536000; path=/";
        },
        description: (
          <>
            উন্নত প্রযুক্তির ই-কমার্স প্ল্যাটফর্মে আপনার কৃষি পণ্য ও সেবার সেরা অভিজ্ঞতা।
          </>
        ),
      });
    }
  }, []);

  return null;
}
