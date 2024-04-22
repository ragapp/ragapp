import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Knowledge } from "../sections/knowledge";
import { ConfigForm } from "../sections/configForm";

export default function Home() {
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (router.asPath.split("#")[1] === "new") {
      setShowWelcome(true);
    }
  }, []);

  function handleDialogState(isOpen: boolean) {
    setShowWelcome(isOpen);
    if (!isOpen) {
      if (window.location.hash === "#new") {
        window.history.pushState({}, document.title, window.location.pathname);
      }
    }
  }

  return (
    <main className={`flex min-h-screen flex-col items-center p-24`}>
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by updating the&nbsp;
          <code className="font-mono font-bold">OpenAI API Key</code>
        </p>
        <div className="fixed bottom-0 left-0 flex   h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none"></div>
      </div>
      <div className="mt-10 max-w-5xl w-full">
        <ConfigForm />
        <Knowledge />
      </div>
      <Toaster />
      <Dialog open={showWelcome} onOpenChange={handleDialogState}>
        <DialogContent>
          <DialogTitle className="text-green-500">
            Congratulations 🎉
          </DialogTitle>
          <DialogDescription>
            You have successfully started RagBox. Now, let's go ahead and
            configure the app.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </main>
  );
}
