"use client";

import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Knowledge } from "@/sections/knowledge";
import { ConfigForm } from "@/sections/configForm";
import { Footer } from "@/sections/footer";
import { StatusBar } from "@/sections/statusBar";
import { DemoChat } from "@/sections/demoChat";

export default function Home() {
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    if (router.asPath.split("#")[1] === "new") {
      setShowWelcome(true);
    }
  }, [router.asPath]);

  function handleDialogState(isOpen: boolean) {
    setShowWelcome(isOpen);
    if (!isOpen) {
      if (window.location.hash === "#new") {
        window.history.pushState({}, document.title, window.location.pathname);
      }
    }
  }

  return (
    <main className="absolute flex flex-col h-full w-full items-center">
      <StatusBar configured={configured} />
      <div
        className={`flex flex-row w-full h-full ${configured ? "" : "justify-center"}`}
      >
        <div className="mt-10 w-1/2 h-full overflow-scroll pb-10 scrollbar-hide">
          <ConfigForm setConfigured={setConfigured} />
          {configured && <Knowledge />}
        </div>
        {configured && <DemoChat />}
      </div>
      <Toaster />
      <Dialog open={showWelcome} onOpenChange={handleDialogState}>
        <DialogContent>
          <DialogTitle className="text-green-500">
            Congratulations 🎉
          </DialogTitle>
          <DialogDescription>
            You have successfully installed RAGapp. Now, let&apos;s go ahead and
            configure it.
          </DialogDescription>
        </DialogContent>
      </Dialog>
      <Footer />
    </main>
  );
}
