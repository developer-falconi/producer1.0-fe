import { ApiResponse, ClientTypeEnum, Participant, PreferenceData, Producer } from "@/types/types";

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

export async function submitTicketForm(formData: FormData, eventId: number, preventId: number | null): Promise<ApiResponse<any>> {
  try {
    let url = `${API_URL}/client/create/${eventId}?type=${ClientTypeEnum.REGULAR}`;
    if (preventId) {
      url += `&prevent=${preventId}`;
    }

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to submit ticket form");
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting ticket form: ", error);
    return { success: false };
  }
}

export async function createPreference(
  preventId: number,
  clients: Participant[],
): Promise<ApiResponse<PreferenceData>> {
  try {
    const response = await fetch(`${API_URL}/mercadopago/create?prevent=${preventId}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clients)
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
