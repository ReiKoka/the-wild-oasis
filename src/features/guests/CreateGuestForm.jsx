import { useForm } from "react-hook-form";

import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { useGuests } from "./useGuests";

function CreateGuestForm() {
  const { register, reset, handleSubmit, formState } = useForm();
  const { errors } = formState;
  const { createGuest, isCreatingGuest } = useGuests();

  function onSubmit({ fullNameGuest, emailGuest, nationalID, nationality }) {
    createGuest(
      { fullNameGuest, emailGuest, nationalID, nationality },
      {
        onSettled: () => reset(),
      }
    );
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormRow label="Full Name" error={errors?.fullNameGuest?.message}>
        <Input
          type="text"
          id="fullNameGuest"
          {...register("fullNameGuest", { required: "This field is required" })}
          disabled={isCreatingGuest}
        />
      </FormRow>

      <FormRow label="Email Address" error={errors?.emailGuest?.message}>
        <Input
          type="email"
          id="emailGuest"
          {...register("emailGuest", { required: "This field is required" })}
          disabled={isCreatingGuest}
        />
      </FormRow>

      <FormRow label="National ID" error={errors?.nationalID?.message}>
        <Input
          type="text"
          id="nationalID"
          {...register("nationalID", { required: "This field is required" })}
          disabled={isCreatingGuest}
        />
      </FormRow>

      <FormRow label="Nationality" error={errors?.nationality?.message}>
        <Input
          type="text"
          id="nationality"
          {...register("nationality", { required: "This field is required" })}
          disabled={isCreatingGuest}
        />
      </FormRow>
      <FormRow>
        <Button
          $variation="secondary"
          type="reset"
          onClick={reset}
          disabled={isCreatingGuest}
        >
          Cancel
        </Button>
        <Button disabled={isCreatingGuest}>Create new guest</Button>
      </FormRow>
    </Form>
  );
}

export default CreateGuestForm;
