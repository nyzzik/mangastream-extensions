import { MangaStreamGeneric } from "./MangaStream";
import { Months } from "./MangaStreamInterfaces";

export function convertDate(
  dateString: string,
  source: MangaStreamGeneric,
): Date {
  // Parsed date string
  dateString = dateString.toLowerCase();

  // Month formats provided by the source
  const dateMonths: Months = source.dateMonths;

  let date: Date | null = null;

  for (const [key, value] of Object.entries(dateMonths)) {
    if (dateString.toLowerCase().includes((value as string).toLowerCase())) {
      date = new Date(dateString.replace(value as string, key ?? ""));
    }
  }

  if (!date || String(date) == "Invalid Date") {
    console.log(
      "Failed to parse chapter date! TO DEV: Please check if the entered months reflect the sites months",
    );
    return new Date();
  }
  return date;
}
