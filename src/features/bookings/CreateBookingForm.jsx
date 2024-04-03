import { useState } from "react";
import styled from "styled-components";
import {
  addDays,
  areIntervalsOverlapping,
  differenceInDays,
  isToday,
} from "date-fns";

import Form from "./../../ui/Form";
import FormRow from "./../../ui/FormRow";
import Input from "./../../ui/Input";
import Button from "../../ui/Button";
import { useGuests } from "../guests/useGuests";
import Spinner from "./../../ui/Spinner";
import { useCabins } from "./../cabins/useCabins";
import { useSettings } from "./../settings/useSettings";
import { Controller, useForm } from "react-hook-form";
import { useCreateBooking } from "./useCreateBooking";
import { formatCurrency } from "../../utils/helpers";
import DatePicker from "react-multi-date-picker";
import { useAllBookings } from "./useAllBookings";

const StyledSelect = styled.select`
  border: 1px solid var(--color-grey-300);
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-sm);
  padding: 0.8rem 1.2rem;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  width: 130%;
  box-sizing: border-box;
`;

const Textarea = styled.textarea`
  padding: 1rem 1.2rem;
  border: 1px solid var(--color-grey-300);
  border-radius: 5px;
  background-color: var(--color-grey-0);
  box-shadow: var(--shadow-sm);
  width: 130%;
  height: 9rem;
  box-sizing: border-box;
  resize: none;
`;

function CreateBookingForm({ onCloseModal }) {
  const { isLoadingGuests, data: guests } = useGuests();
  const { isLoading: isLoadingCabins, cabins } = useCabins();
  const { allBookings, isLoading: isLoadingAllBookings } = useAllBookings();
  const { isLoading: isLoadingSettings, settings } = useSettings();
  const { isCreatingBooking, createBooking } = useCreateBooking();
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange === null ? ["", ""] : dateRange;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    setValue,
    control,
  } = useForm();

  function onSubmit({
    guestId,
    cabinId,
    numGuests,
    regularPrice,
    isPaid,
    bookingDates,
    hasBreakfast,
    observations,
  }) {
    const cabinPrice = Number(regularPrice.replace(/[^0-9]/g, "").slice(0, -2));
    console.log(cabinPrice);

    const start = bookingDates[0].format();
    const end = bookingDates[1].format();

    const startDateDate = new Date(start);
    const endDateDate = new Date(end);

    console.log(startDateDate);

    console.log(cabinId);

    const unAvailableNights = allBookings
      ?.filter((booking) => booking.cabinId === Number(cabinId))
      .map((booking) => ({
        startDate: booking.startDate,
        endDate: booking.endDate,
      }));

    console.log(unAvailableNights);

    for (let booking of unAvailableNights) {
      console.log(booking);

      if (
        areIntervalsOverlapping(
          {
            start: new Date(booking.startDate),
            end: new Date(booking.endDate),
          },
          {
            start: startDateDate,
            end: endDateDate,
          }
        )
      ) {
        setError(
          "bookingDates",
          {
            type: "manual",
            message:
              "The cabin selected is unavailable for the selected dates. Please choose another cabin or other dates",
          },
          {
            shouldFocus: true,
          }
        );
        return;
      }
    }

    // 2. Convert the hasBreakfast and isPaid values into boolean values as they come as a string from the form
    const hasBreakfastBoolean = hasBreakfast === "true";
    const isPaidBoolean = isPaid === "true";

    // 3. Checking the min and max booking length according to settings values, and manually setting the errors into the field.
    if (
      differenceInDays(endDateDate, startDateDate) < 2 ||
      differenceInDays(endDateDate, startDateDate) > settings.maxBookingLength
    ) {
      setError(
        "bookingDates",
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
      cabinPrice: cabinPrice,
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

  if (
    isLoadingCabins ||
    isLoadingSettings ||
    isLoadingGuests ||
    isLoadingAllBookings
  )
    return <Spinner />;

  return (
    <Form
      type={onCloseModal ? "modal" : "regular"}
      onSubmit={handleSubmit(onSubmit)}
    >
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
          defaultValue={cabins[0]}
          {...register("cabinId", {
            required: "This field is required",
          })}
          onChange={(e) =>
            setValue(
              "regularPrice",
              `${formatCurrency(
                cabins.find((cabin) => cabin.id === Number(e.target.value))
                  .regularPrice
              )}/night`
            )
          }
        >
          {cabins?.map((cabin) => (
            <option key={cabin.id} value={cabin.id}>
              {cabin.name} - ({cabin.maxCapacity} guests)
            </option>
          ))}
        </StyledSelect>
      </FormRow>

      <FormRow label="Cabin price" error={errors.regularPrice?.message}>
        <Input
          type="text"
          id="regularPrice"
          readOnly={true}
          defaultValue={`${formatCurrency(cabins[0].regularPrice)}/night`}
          {...register("regularPrice", {
            required: "This field is required",
          })}
        />
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

      <Controller
        control={control}
        name="bookingDates"
        rules={{ required: "This field is required" }}
        render={({ field: { onChange } }) => (
          <FormRow label="Booking Dates" error={errors?.bookingDates?.message}>
            <DatePicker
              inputClass="date-picker"
              className="custom-calendar"
              format="MMMM DD, YYYY"
              // dateSeparator=" to "
              range={true}
              rangeHover={true}
              weekStartDayIndex={1}
              numberOfMonths={2}
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              maxDate={addDays(new Date(), settings.maxBookingLength)}
              showOtherDays={false}
              id="bookingDates"
              onChange={(e) => {
                if (e === null) onChange("");
                if (e?.length === 2) {
                  console.log(e);
                  setDateRange(e);
                  onChange(e);
                }
              }}
            />
          </FormRow>
        )}
      />

      <FormRow label="Add breakfast" error={errors?.hasBreakfast?.message}>
        <StyledSelect
          disabled={isCreatingBooking}
          id="hasBreakfast"
          defaultValue={false}
          {...register("hasBreakfast")}
        >
          <option value={true}>
            Yes ({formatCurrency(settings.breakfastPrice)}/guest)
          </option>
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
