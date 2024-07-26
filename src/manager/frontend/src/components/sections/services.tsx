import { useQuery } from "react-query"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { getServices } from "@/client/service";
import Link from "next/link";
import { Service } from "@/client/models/service";
import { TbRobot, TbFilePencil } from "react-icons/tb";
import { ImSpinner8 } from "react-icons/im";

function ServiceCard({ service }: { service: Service }) {
    return (
        <Card key={service.id} className="p-4">
            <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center text-foreground">
                    <TbRobot size={30} />
                    {service.app_name ? service.app_name : service.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="font-bold text-foreground">State:</p>
                <ul className="list-disc ml-5 text-muted-foreground">
                    <li className="bold" >Status: {
                        service.status === "running"
                            ? <span className="text-green">
                                Running</span>
                            : <span className="text-red">Stopped</span>
                    }</li>
                    <li>Started At: {service.started_at}</li>
                    <li>Restart Count: {service.restart_count}</li>
                </ul>
            </CardContent>
            <CardFooter className="flex justify-between">
                <a
                    href={`${service.url}/admin`}
                    className="text-primary-foreground"
                >
                    <Button variant="outline" className="flex items-center text-muted-foreground">
                        <TbFilePencil size={20} />
                        Edit
                    </Button>
                </a>
            </CardFooter>
        </Card>
    )
}

export function ServicesList() {
    const { data, error, isLoading } = useQuery('services', getServices);

    return (
        <>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">
                    Agents
                </h1>
            </header>
            <section>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pr-8">
                    {
                        isLoading
                            ? <div className="flex justify-center animate-spin items-start w-10"><ImSpinner8 /></div>
                            : (
                                data?.map(service => (
                                    <ServiceCard service={service} />
                                ))
                            )
                    }
                </div>
            </section>
        </>
    )
}

