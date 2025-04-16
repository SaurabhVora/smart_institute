import { format, isValid } from "date-fns";

// Helper function to safely format dates
export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "Date unknown";
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return isValid(date) ? format(date, "MMM d, h:mm a") : "Invalid date";
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date error";
  }
}; 