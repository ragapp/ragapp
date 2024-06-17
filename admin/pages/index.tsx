"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { ConfigForm } from "@/sections/config/form";
import { ToolConfig } from "@/sections/config/tool";
import { DemoChat } from "@/sections/demoChat";
import { Footer } from "@/sections/footer";
import { Knowledge } from "@/sections/knowledge";
import { StatusBar } from "@/sections/statusBar";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
    <>
      <main className="h-screen w-screen">
        <div className="flex flex-col max-h-full h-full">
          <div className="w-full shrink-0">
            <StatusBar configured={configured} />
          </div>
          <div className="w-full flex-1 overflow-auto flex">
            <div
              className={cn("w-1/2 overflow-y-auto p-4", {
                "m-auto": !configured,
              })}
            >
              <ConfigForm setConfigured={setConfigured} />
              {configured && (
                <>
                  <ToolConfig />
                  <Knowledge />
                </>
              )}
            </div>
            {configured && (
              <div className="flex-1 overflow-y-auto p-4">
                <DemoChat />
              </div>
            )}
          </div>
          <div className="w-full shrink-0">
            <Footer />
          </div>
        </div>
      </main>
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
    </>
  );
}
