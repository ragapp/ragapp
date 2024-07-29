import { getBaseURL } from "./util";
import { Service } from "./models/service";

export const getServices = async (): Promise<Service[]> => {
    const response = await fetch(`${getBaseURL()}/api/services`);
    const data = await response.json();
    return data;
}

export const stopService = async (serviceId: string): Promise<void> => {
    await fetch(`${getBaseURL()}/api/services/${serviceId}/stop`, {
        method: 'POST',
    });
}

export const startService = async (serviceId: string): Promise<void> => {
    await fetch(`${getBaseURL()}/api/services/${serviceId}/start`, {
        method: 'POST',
    });
}

export const removeService = async (serviceId: string): Promise<void> => {
    await fetch(`${getBaseURL()}/api/services/${serviceId}`, {
        method: 'DELETE',
    });
}