import { useMutation } from "@tanstack/react-query";
import { createGuest as createGuestAPI } from "../../services/apiGuests";
import toast from "react-hot-toast";

export function useCreateGuest() {
  const { mutate: createGuest, isLoading: isCreatingGuest } = useMutation({
    mutationFn: createGuestAPI,
    onSuccess: () => {
      toast.success(
        "New guest successfully created! Please continue to add the booking!"
      );
    },
  });

  return { createGuest, isCreatingGuest };
}
