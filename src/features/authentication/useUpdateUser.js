import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCurrentUser } from "../../services/apiAuth";
import toast from "react-hot-toast";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  const { mutate: updateUser, isLoading: isUpdating } = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (user) => {
      console.log(user)
      toast.success("User account successfully updated");
      // queryClient.setQueryData(['user'], user)
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  return { updateUser, isUpdating };
}
