"use client";
import type { ChangeEvent, FormEvent } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { getAuthFeedback } from "#/lib/auth-feedback";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [formData, setFormData] = useState({ inviteCode: "" });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const feedback = getAuthFeedback(res.status);
      toast[feedback.kind](feedback.title, { description: feedback.description });
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again later",
      });
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main>
      <video
        className="absolute top-56 md:top-64 lg:top-60 w-full h-auto min-h-screen object-cover opacity-60 z-0"
        autoPlay
        muted
        loop
      >
        <source src="assets/bg_av1.mp4" type="video/mp4" />
        <source src="assets/bg.webm" type="video/webm" />
        <source src="assets/bg.mp4" type="video/mp4" />
      </video>
      <div className="flex items-center justify-center h-screen bg-primary-gradient z-10 relative">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-white md:text-5xl lg:text-6xl">
            <span className="underline decoration-8 decoration-primary">
              Anonymous
              <br />
            </span>{" "}
            email forwarding
            <br />
            service
          </h1>
          <form
            onSubmit={(e) => {
              void handleSubmit(e);
            }}
          >
            <div className="flex justify-center gap-2">
              <Input
                type="text"
                placeholder="Invite Code"
                className="w-36"
                name="inviteCode"
                onChange={handleInputChange}
              />
              <Button type="submit" variant="default" className="rounded-none px-4">
                <ArrowRight className="size-6" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
