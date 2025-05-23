"use client";

import { initializePaddle } from "@paddle/paddle-js";
import { useEffect } from "react";

function PaddleForm() {
  useEffect(() => {
    const paddleToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (paddleToken) {
      initializePaddle({
        environment: "sandbox",
        token: paddleToken,
        debug: true,
      }).then((instance) => {
        console.log("Paddle initialized", instance);
      });
    } else {
      console.error("Paddle client token is not defined");
    }
  }, []);
  return null;
}

export default PaddleForm;
