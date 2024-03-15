import { useForm } from "react-hook-form";
import Form from "../../ui/Form";
// eslint-disable-next-line no-unused-vars
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import Spinner from "../../ui/Spinner";

import { useSettings } from "./useSettings";
import { useUpdateSetting } from "./useUpdateSetting";

function UpdateSettingsForm() {
  const {
    register,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();
  const { isUpdating, updateSetting } = useUpdateSetting();

  const {
    isLoading,
    settings: {
      minBookingLength,
      maxBookingLength,
      maxGuestsPerBooking,
      breakfastPrice,
    } = {},
  } = useSettings();

  if (isLoading) return <Spinner />;

  function handleUpdate(e, field) {
    const { value, defaultValue } = e.target;
    console.log(value);

    if (value === defaultValue) {
      setError(field, {
        type: "manual",
        message: `Please write a different number from the one currently saved!`,
      });
      return;
    }

    if (!value || Number(value) <= 0) {
      setError(field, {
        type: "manual",
        message:
          value === ""
            ? "This field is required!"
            : "0 or negative numbers are not allowed!",
      });
      return;
    }

    clearErrors(field);
    updateSetting({ [field]: Number(value) });
  }

  console.log(errors);

  return (
    <Form>
      <FormRow
        label="Minimum nights/booking"
        error={errors?.minBookingLength?.message}
      >
        <Input
          type="number"
          id="min-nights"
          defaultValue={minBookingLength}
          {...register("minBookingLength", {
            disabled: isUpdating,
            onBlur: (e) => handleUpdate(e, "minBookingLength"),
          })}
        />
      </FormRow>

      <FormRow
        label="Maximum nights/booking"
        error={errors?.maxBookingLength?.message}
      >
        <Input
          type="number"
          id="max-nights"
          defaultValue={maxBookingLength}
          {...register("maxBookingLength", {
            disabled: isUpdating,
            onBlur: (e) => handleUpdate(e, "maxBookingLength"),
          })}
        />
      </FormRow>

      <FormRow
        label="Maximum guests/booking"
        error={errors?.maxGuestsPerBooking?.message}
      >
        <Input
          type="number"
          id="max-guests"
          defaultValue={maxGuestsPerBooking}
          {...register("maxGuestsPerBooking", {
            disabled: isUpdating,
            onBlur: (e) => handleUpdate(e, "maxGuestsPerBooking"),
          })}
        />
      </FormRow>

      <FormRow label="Breakfast price" error={errors?.breakfastPrice?.message}>
        <Input
          type="number"
          id="breakfast-price"
          defaultValue={breakfastPrice}
          {...register("breakfastPrice", {
            disabled: isUpdating,
            onBlur: (e) => handleUpdate(e, "breakfastPrice"),
          })}
        />
      </FormRow>
    </Form>
  );
}

export default UpdateSettingsForm;
