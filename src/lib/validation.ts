export type DonorInput = {
  quantity: number;
  preparedAt?: Date;
  pickupBy: Date;
};

// Returns an error message for the first failing check, or null when the input is valid.
export function validateDonorInput(input: DonorInput, now: Date): string | null {
  if (!(input.quantity > 0)) return "Quantity must be more than 0 kg.";
  if (input.preparedAt && input.preparedAt.getTime() > now.getTime()) return "Prepared-at cannot be in the future.";
  if (!(input.pickupBy.getTime() > now.getTime())) return "Pickup-by must be in the future.";
  return null;
}
