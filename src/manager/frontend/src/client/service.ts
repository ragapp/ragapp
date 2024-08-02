import { RAGAppFormType, Service } from "./models/service";
import { getBaseURL } from "./util";

export const getServices = async (): Promise<Service[]> => {
  try {
    const response = await fetch(`${getBaseURL()}/api/services`);
    if (!response.ok) {
      throw new Error("Failed to get services");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const stopService = async (serviceId: string): Promise<void> => {
  try {
    const response = await fetch(
      `${getBaseURL()}/api/services/${serviceId}/stop`,
      {
        method: "POST",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to stop service");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const startService = async (serviceId: string): Promise<void> => {
  try {
    const response = await fetch(
      `${getBaseURL()}/api/services/${serviceId}/start`,
      {
        method: "POST",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to start service");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const removeService = async (serviceId: string): Promise<void> => {
  try {
    const response = await fetch(`${getBaseURL()}/api/services/${serviceId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to remove service");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createRAGAppService = async (values: RAGAppFormType) => {
  const res = await fetch(`${getBaseURL()}/api/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!res.ok) {
    console.error(res);
    throw new Error("Failed to create service");
  }

  return await res.json();
};
