"use client";

import { useEffect } from "react";
import { pushNotificationService } from "@/lib/push-notification-service";

export function PushNotificationInitializer() {
  useEffect(() => {
    // Initialize push notifications on app start
    pushNotificationService.initialize().then((granted) => {
      if (granted) {
        console.log('Push notifications enabled');
      } else {
        console.log('Push notifications not granted');
      }
    });
  }, []);

  return null;
}