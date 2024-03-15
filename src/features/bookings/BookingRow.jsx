/* eslint-disable no-unused-vars */
import styled from "styled-components";
import { format, isToday } from "date-fns";
import {
  HiArrowDownOnSquare,
  HiArrowUpOnSquare,
  HiEye,
  HiTrash,
} from "react-icons/hi2";
import { useNavigate, useSearchParams } from "react-router-dom";

import Tag from "../../ui/Tag";
import Table from "../../ui/Table";
import Menus from "./../../ui/Menus";
import Modal from "../../ui/Modal";
import ConfirmDelete from "../../ui/ConfirmDelete";

import { formatCurrency } from "../../utils/helpers";
import { formatDistanceFromNow } from "../../utils/helpers";
import { useCheckout } from "../check-in-out/useCheckout";
import { useDeleteBooking } from "./useDeleteBooking";
import { useBookings } from "./useBookings";

const Cabin = styled.div`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-600);
  font-family: "Sono";
`;

const Stacked = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  & span:first-child {
    font-weight: 500;
  }

  & span:last-child {
    color: var(--color-grey-500);
    font-size: 1.2rem;
  }
`;

const Amount = styled.div`
  font-family: "Sono";
  font-weight: 500;
`;

function BookingRow({
  booking: {
    id: bookingId,
    created_at,
    startDate,
    endDate,
    numNights,
    numGuests,
    totalPrice,
    status,
    guests: { fullName: guestName, email },
    cabins: { name: cabinName },
  },
}) {
  const statusToTagName = {
    unconfirmed: "blue",
    "checked-in": "green",
    "checked-out": "silver",
  };

  const navigate = useNavigate();
  const { checkout, isCheckingOut } = useCheckout();
  const { deleteBooking, isDeleting } = useDeleteBooking();

  const [searchParams, setSearchParams] = useSearchParams();

  const { count } = useBookings();
  const currentPage = !searchParams.get("page")
    ? 1
    : Number(searchParams.get("page"));

  const currentStatus = searchParams?.get("status");
  const currentSortBy = searchParams?.get("sortBy");

  return (
    <Table.Row>
      <Cabin>{cabinName}</Cabin>

      <Stacked>
        <span>{guestName}</span>
        <span>{email}</span>
      </Stacked>

      <Stacked>
        <span>
          {isToday(new Date(startDate))
            ? "Today"
            : formatDistanceFromNow(startDate)}{" "}
          &rarr; {numNights} night stay
        </span>
        <span>
          {format(new Date(startDate), "MMM dd yyyy")} &mdash;{" "}
          {format(new Date(endDate), "MMM dd yyyy")}
        </span>
      </Stacked>

      <Tag type={statusToTagName[status]}>{status.replace("-", " ")}</Tag>

      <Amount>{formatCurrency(totalPrice)}</Amount>

      <Modal>
        <Menus.Menu>
          <Menus.Toggle id={bookingId} />
          <Menus.List id={bookingId}>
            <Menus.Button
              icon={<HiEye />}
              onClick={() => {
                navigate(`/bookings/${bookingId}`, {
                  state: { currentPage, currentStatus, currentSortBy, count },
                });
              }}
            >
              See Details
            </Menus.Button>
            {status === "checked-in" && (
              <Menus.Button
                icon={<HiArrowUpOnSquare />}
                onClick={() => {
                  checkout(bookingId);
                }}
                disabled={isCheckingOut}
              >
                Check out
              </Menus.Button>
            )}
            {status === "unconfirmed" && (
              <Menus.Button
                icon={<HiArrowDownOnSquare />}
                onClick={() => navigate(`/checkin/${bookingId}`)}
              >
                Check In
              </Menus.Button>
            )}

            <Modal.Open opens="delete">
              <Menus.Button icon={<HiTrash />}>Delete booking</Menus.Button>
            </Modal.Open>
          </Menus.List>
        </Menus.Menu>

        <Modal.Window name="delete">
          <ConfirmDelete
            resourceName="booking"
            disabled={isDeleting}
            onConfirm={() => {
              deleteBooking(bookingId);

              // 1. The first if condition here is to take from the count of the bookings the last number.
              //    Because you want to move to the previous page only if the last number of the count is 1.
              //    So for example, if you have 22 bookings, when you delete a booking the number of the count
              //    will be 21 so it will stay on page 3 but as soon as you delete the 21st booking this if block
              //    will check if the last digit of the number is equal to 1.
              // 2. The 2nd if block basically checks when the count is 0 so that then it removes the page param from
              //    the URL. There is also a ternary operator to check if the currentPage === 1 this is because, if you
              //    just delete some items from page number 1 while still having large number of bookings, or if you are
              //    on the bookings URL but you don't have any page param it would result in a bug where the page would become
              //    0 and then it would also ruin the page count on the table footer.

              if (Number(count.toString().split("").slice(-1).join("")) === 1) {
                if (
                  Number(count.toString().split("").slice(0, -1).join("")) > 0
                ) {
                  searchParams.set(
                    "page",
                    currentPage === 1 ? 1 : currentPage - 1
                  );
                  currentPage !== 1 && setSearchParams(searchParams);
                } else {
                  searchParams.delete("page");
                  setSearchParams(searchParams);
                }
              }
            }}
          />
        </Modal.Window>
      </Modal>
    </Table.Row>
  );
}

export default BookingRow;
