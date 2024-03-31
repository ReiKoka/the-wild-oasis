import { useQuery } from "@tanstack/react-query";
import { getAllBookings } from "../../services/apiBookings";

export function useAllBookings() {
  const {isLoading, data: allBookings} = useQuery({
    queryKey: ['allBookings'],
    queryFn: getAllBookings
  })

  return {isLoading, allBookings}
}