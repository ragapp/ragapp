import { getBaseURL } from "./util";
import { Service } from "./models/service";

export const getServices = async (): Promise<Service[]> => {
    const response = await fetch(`${getBaseURL()}/api/services`);
    const data = await response.json();
    return data;
}
