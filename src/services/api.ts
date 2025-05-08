import { ApiResponse, Producer } from "@/types/api";

const API_URL = `https://ticketera-be-prod-56736542635.southamerica-east1.run.app/api`;
// const API_URL = `http:/localhost:4000/api`;

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

export async function submitTicketForm(formData: FormData, eventId: number): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_URL}/client/create/${eventId}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to submit ticket form");
    }

    return { success: true };
  } catch (error) {
    console.error("Error submitting ticket form:", error);
    return { success: false };
  }
}