import { ApiResponse, ClientTypeEnum, PreferenceData, Producer } from "@/types/types";

const API_URL = import.meta.env.VITE_APP_API_BE;

export async function fetchProducerData(): Promise<ApiResponse<Producer>> {
  try {
    const response = await fetch(`${API_URL}/producer/domain`);
    if (!response.ok) {
      throw new Error("Failed to fetch producer data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching producer data:", error);
    throw error;
  }
}

export async function submitTicketForm(formData: FormData, eventId: number): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_URL}/client/create/${eventId}?type=${ClientTypeEnum.REGULAR}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to submit ticket form");
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting ticket form:", error);
    return { success: false };
  }
}

export async function createPreference(preventId: number, quantity: number): Promise<ApiResponse<PreferenceData>> {
  try {
    const response = await fetch(`${API_URL}/mercadopago/create?prevent=${preventId}&quantity=${quantity}`, {
      method: "POST"
    });

    if (!response.ok) {
      throw new Error("Failed to submit ticket form");
    }
    return await response.json();
  } catch (error) {
    console.error("Error submitting ticket form:", error);
    return { success: false };
  }
}