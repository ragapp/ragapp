import { Service } from "@/client/models/service";
import {
  getServices,
  removeService,
  startService,
  stopService,
} from "@/client/service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

import { TooltipProvider } from "@radix-ui/react-tooltip";
import { LoaderCircle, Pause, Play, Settings2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { CreateAgentDialog } from "./createAgent";

function AlertDialogRemoveApp({
  service,
  refetch,
}: {
  service: Service;
  refetch: () => void;
}) {
  async function handleRemoveService() {
    await removeService(service.id);
    refetch();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost">
          <Trash2 size={20} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {service.app_name}?</AlertDialogTitle>
          <AlertDialogDescription>
            All the data and the configuration will be removed. Are you really
            sure you want to delete this app?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRemoveService}>
            Ok
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function StartStopButton({
  service,
  refetch,
}: {
  service: Service;
  refetch: () => void;
}) {
  const [isHandling, setIsHandling] = useState(false);

  async function handleStopService() {
    setIsHandling(true);
    await stopService(service.id);
    refetch();
    setIsHandling(false);
  }

  async function handleStartService() {
    setIsHandling(true);
    await startService(service.id);
    refetch();
    setIsHandling(false);
  }

  return service.status === "running" ? (
    <Button
      variant="outline"
      className="flex items-center text-muted-foreground"
      onClick={handleStopService}
      disabled={isHandling}
    >
      <Pause size={20} />
    </Button>
  ) : (
    <Button
      variant="outline"
      className="flex items-center text-muted-foreground"
      onClick={handleStartService}
      disabled={isHandling}
    >
      <Play size={20} />
    </Button>
  );
}

function ServiceCard({
  service,
  refetch,
}: {
  service: Service;
  refetch: () => void;
}) {
  return (
    <TooltipProvider>
      <Card key={service.id} className="shadow-md">
        <CardHeader className="flex flex-row justify-between">
          <CardTitle className="text-xl font-bold flex items-center text-foreground">
            <a href={service.url} target="_blank">
              {service.app_name ? service.app_name : service.name}
            </a>
          </CardTitle>
          <AlertDialogRemoveApp service={service} refetch={refetch} />
        </CardHeader>
        <CardContent>
          <p className="text-foreground">
            State:{" "}
            {service.status === "running" ? (
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-green">Running</span>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span>since {service.started_at}</span>
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="text-red">Stopped</span>
            )}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <a
            className="text-primary-foreground"
            href={`${service.url}/admin/`}
            target="_blank"
          >
            <Button
              variant="outline"
              className="flex items-center text-muted-foreground"
            >
              <Settings2 size={20} className="mr-2" />
              Edit
            </Button>
          </a>
          <StartStopButton service={service} refetch={refetch} />
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}

export function ServicesList() {
  const { data, error, isLoading, refetch } = useQuery("services", getServices);
  const [addAgentDialogOpen, setAddAgentDialogOpen] = useState(false);

  useEffect(() => {
    if (!addAgentDialogOpen) {
      refetch();
    }
  }, [addAgentDialogOpen, refetch]);

  return (
    <>
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Apps</h1>
        <CreateAgentDialog
          open={addAgentDialogOpen}
          setOpen={setAddAgentDialogOpen}
        />
        <Button onClick={() => setAddAgentDialogOpen(true)}>+ New App</Button>
      </header>
      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pr-8">
          {isLoading ? (
            <div className="flex justify-center animate-spin items-start w-10">
              <LoaderCircle />
            </div>
          ) : data?.length === 0 ? (
            <p className="text-foreground">
              No apps found. Let&apos;s create one!
            </p>
          ) : (
            data?.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                refetch={refetch}
              />
            ))
          )}
        </div>
      </section>
    </>
  );
}
