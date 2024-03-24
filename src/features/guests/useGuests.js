import { useQuery } from "@tanstack/react-query";
import { getGuests } from "../../services/apiGuests";

export function useGuests() {
  const { isLoading: isLoadingGuests, data } = useQuery({
    queryKey: ["guests"],
    queryFn: getGuests,
  });

  return { isLoadingGuests, data };
}
