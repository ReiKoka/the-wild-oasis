import { useState } from "react";
import styled from "styled-components";
import { differenceInDays, format, isToday } from "date-fns";

import Form from "./../../ui/Form";
import FormRow from "./../../ui/FormRow";
import Input from "./../../ui/Input";
import Button from "../../ui/Button";
import { useGuests } from "../guests/useGuests";
import Spinner from "./../../ui/Spinner";
import { useCabins } from "./../cabins/useCabins";
import { useSettings } from "./../settings/useSettings";
import { useForm } from "react-hook-form";
import { useCreateBooking } from "./useCreateBooking";
import { formatCurrency } from "../../utils/helpers";

const StyledSelect = styled.select`
  border: 1px solid var(--color-grey-300);
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.2rem;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
`;

const Textarea = styled.textarea`
  padding: 1rem 1.2rem;
  border: 1px solid var(--color-grey-300);
  border-radius: 5px;
  background-color: var(--color-grey-0);
  box-shadow: var(--shadow-sm);
  width: 100%;
  height: 9rem;
  box-sizing: border-box;
  resize: none;
`;

function CreateBookingForm({ onCloseModal }) {
  const { isLoadingGuests, data: guests } = useGuests();
  const { isLoading: isLoadingCabins, cabins } = useCabins();
  const { isLoading: isLoadingSettings, settings } = useSettings();
  const { isCreatingBooking, createBooking } = useCreateBooking();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm();

  function onSubmit({
    guestId,
    cabinId,
    numGuests,
    startDate,
    endDate,
    isPaid,
    hasBreakfast,
    observations,
  }) {
    // 1. Convert the dates string into date objects
    const startDateDate = new Date(startDate);
    const endDateDate = new Date(endDate);

    // 2. Convert the hasBreakfast and isPaid values into boolean values as they come as a string from the form
    const hasBreakfastBoolean = hasBreakfast === "true";
    const isPaidBoolean = isPaid === "true";

    // 3. Checking the min and max booking length according to settings values, and manually setting the errors into the field.
    if (
      differenceInDays(endDateDate, startDateDate) < 2 ||
      differenceInDays(endDateDate, startDateDate) > settings.maxBookingLength
    ) {
      setError(
        "endDate",
        {
          type: "manual",
          message: `The number of nights should be between ${settings.minBookingLength} and ${settings.maxBookingLength}`,
        },
        {
          shouldFocus: true,
        }
      );
      return;
    }

    // 4. If the previous condition is successful  assign the difference in days between endDate and startDate to numNights variable.
    const numNights = differenceInDays(endDateDate, startDateDate);

    // 5. Getting the cabin price by using the received cabinId from the form
    const cabinPrice = cabins.find(
      (cabin) => cabin.id === Number(cabinId)
    ).regularPrice;

    // 6. Getting the extras price by using the form values to check if hasBreakfastBoolean is true or false
    const extrasPrice = hasBreakfastBoolean
      ? numNights * (numGuests * settings.breakfastPrice)
      : 0;

    // 7. Calculating the total Price
    //    Formula: (numNights * cabinPrice) - (numNights * discount) + extrasPrice
    const totalPrice =
      numNights * cabinPrice -
      numNights *
        cabins.find((cabin) => cabin.id === Number(cabinId)).discount +
      extrasPrice;

    // 8. Getting the cabin capacity
    const cabinCapacity = cabins.find(
      (cabin) => Number(cabin.id) === Number(cabinId)
    ).maxCapacity;

    // 9. Checking if the number of guests input is bigger than cabin capacity. If true, setError method from useForm is used to manually set the error to the form.
    if (numGuests > cabinCapacity) {
      setError(
        "numGuests",
        {
          type: "manual",
          message: `Number of guests can not exceed the selected cabin's max capacity`,
        },
        {
          shouldFocus: true,
        }
      );
    }

    // 10. Programatically calculating the status, which can only be checked-in if the date is on the day of the booking, and the price has been paid.
    const status =
      isToday(startDateDate) && isPaidBoolean ? "checked-in" : "unconfirmed";

    // 11. Creating the final data object to be sent to the createBooking function.
    const data = {
      guestId: Number(guestId),
      cabinId: Number(cabinId),
      numGuests: Number(numGuests),
      numNights,
      cabinPrice,
      extrasPrice,
      totalPrice,
      status,
      startDate: startDateDate,
      endDate: endDateDate,
      hasBreakfast: hasBreakfastBoolean,
      isPaid: isPaidBoolean,
      observations,
    };

    console.log(data);
    createBooking(data, {
      onSettled: () => reset(),
      onSuccess: onCloseModal?.(),
    });
  }

  if (isLoadingCabins || isLoadingSettings || isLoadingGuests)
    return <Spinner />;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormRow label="Guest Name" error={errors?.guestId?.message}>
        <StyledSelect
          disabled={isCreatingBooking}
          id="guestId"
          {...register("guestId", {
            required: "This field is required",
          })}
        >
          {guests?.map((guest) => (
            <option key={guest.id} value={guest.id}>
              {guest.fullName}
            </option>
          ))}
        </StyledSelect>
      </FormRow>

      <FormRow label="Cabin Name" error={errors?.cabinId?.message}>
        <StyledSelect
          disabled={isCreatingBooking}
          id="cabinId"
          defaultValue={cabins[0].name}
          {...register("cabinId", {
            required: "This field is required",
          })}
        >
          {cabins?.map((cabin) => (
            <option key={cabin.id} value={cabin.id}>
              {cabin.name} ({formatCurrency(cabin.regularPrice)}/night)
            </option>
          ))}
        </StyledSelect>
      </FormRow>

      <FormRow label="Number of guests" error={errors?.numGuests?.message}>
        <Input
          type="number"
          id="numGuests"
          defaultValue={1}
          disabled={isCreatingBooking}
          {...register("numGuests", {
            required: "This field is required",
            min: {
              value: 1,
              message: "Number of guests can not be less than 1",
            },
            max: {
              value: settings.maxGuestsPerBooking,
              message: `Number of guests can not be more than ${settings.maxGuestsPerBooking}`,
            },
          })}
        />
      </FormRow>

      <FormRow label="Start Date" error={errors?.startDate?.message}>
        <Input
          disabled={isCreatingBooking}
          type="date"
          id="startDate"
          min={format(startDate, "yyyy-MM-dd")}
          onChange={(e) => format(setStartDate(e.target.value), "yyyy-MM-dd")}
          {...register("startDate", {
            required: "This field is required",
            value: format(startDate, "yyyy-MM-dd"),
          })}
        />
      </FormRow>

      <FormRow label="End Date" error={errors?.endDate?.message}>
        <Input
          disabled={isCreatingBooking}
          type="date"
          id="endDate"
          min={format(endDate, "yyyy-MM-dd")}
          onChange={(e) => format(setEndDate(e.target.value), "yyyy-MM-dd")}
          {...register("endDate", {
            required: "This field is required",
          })}
        />
      </FormRow>

      <FormRow label="Add breakfast" error={errors?.hasBreakfast?.message}>
        <StyledSelect
          disabled={isCreatingBooking}
          id="hasBreakfast"
          defaultValue={false}
          {...register("hasBreakfast")}
        >
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </StyledSelect>
      </FormRow>

      <FormRow label="Payment Received" error={errors?.isPaid?.message}>
        <StyledSelect
          disabled={isCreatingBooking}
          id="isPaid"
          defaultValue={false}
          {...register("isPaid")}
        >
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </StyledSelect>
      </FormRow>

      <FormRow label="Observations" error={errors?.observations?.message}>
        <Textarea
          type="text"
          disabled={isCreatingBooking}
          id="observations"
          {...register("observations")}
        />
      </FormRow>

      <FormRow>
        <Button
          $variation="secondary"
          type="reset"
          onClick={() => onCloseModal?.()}
          disabled={isCreatingBooking}
        >
          Cancel
        </Button>
        <Button disabled={isCreatingBooking}>Add new Booking</Button>
      </FormRow>
    </Form>
  );
}

export default CreateBookingForm;
