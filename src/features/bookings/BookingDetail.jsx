import { useLocation, useNavigate } from "react-router-dom";
import { HiArrowUpOnSquare } from "react-icons/hi2";
import styled from "styled-components";

import { useBooking } from "./useBooking";
import { useMoveBack } from "../../hooks/useMoveBack";
import { useCheckout } from "../check-in-out/useCheckout";
import { useDeleteBooking } from "./useDeleteBooking";

import BookingDataBox from "./BookingDataBox";
import Row from "../../ui/Row";
import Heading from "../../ui/Heading";
import Tag from "../../ui/Tag";
import ButtonGroup from "../../ui/ButtonGroup";
import Button from "../../ui/Button";
import ButtonText from "../../ui/ButtonText";
import Spinner from "./../../ui/Spinner";
import Modal from "../../ui/Modal";
import ConfirmDelete from "../../ui/ConfirmDelete";
import Empty from "../../ui/Empty";

const HeadingGroup = styled.div`
  display: flex;
  gap: 2.4rem;
  align-items: center;
`;

function BookingDetail() {
  const { booking, isLoading } = useBooking();
  const moveBack = useMoveBack();
  const navigate = useNavigate();
  const { checkout, isCheckingOut } = useCheckout();
  const { isDeleting, deleteBooking } = useDeleteBooking();

  const { state } = useLocation();

  if (isLoading) return <Spinner />;
  if (!booking) return <Empty resourceName="booking" />;

  const { status, id: bookingId } = booking;

  const statusToTagName = {
    unconfirmed: "blue",
    "checked-in": "green",
    "checked-out": "silver",
  };

  return (
    <>
      <Row type="horizontal">
        <HeadingGroup>
          <Heading as="h1">Booking #{bookingId}</Heading>
          <Tag type={statusToTagName[status]}>{status.replace("-", " ")}</Tag>
        </HeadingGroup>
        <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
      </Row>

      <BookingDataBox booking={booking} />

      <ButtonGroup>
        {status === "checked-in" && (
          <Button
            $icon={<HiArrowUpOnSquare />}
            onClick={() => {
              checkout(bookingId);
            }}
            disabled={isCheckingOut}
          >
            Check out
          </Button>
        )}
        {status === "unconfirmed" && (
          <Button onClick={() => navigate(`/checkin/${bookingId}`)}>
            Check In
          </Button>
        )}
        <Modal>
          <Modal.Open opens="delete">
            <Button $variation="danger">Delete Booking</Button>
          </Modal.Open>
          <Modal.Window name="delete">
            <ConfirmDelete
              resourceName="booking"
              disabled={isDeleting}
              onConfirm={() => {
                deleteBooking(bookingId, {
                  onSettled: () => {
                    if (state.resultFrom === state.resultTo) {
                      navigate(
                        `/bookings/?${Number(state.count.toString().split("").slice(0, -1).join("")) > 0 ? `page=${state.currentPage === 1 ? 1 : state.currentPage - 1}` : ""}${state.currentStatus === null ? "" : "&status=" + state.currentStatus}${state.currentSortBy === null ? "" : "&sortBy=" + state.currentSortBy}`
                      );
                    } else {
                      navigate(-1);
                    }
                  },
                });
              }}
            />
          </Modal.Window>
        </Modal>
        <Button $variation="secondary" onClick={moveBack}>
          Back
        </Button>
      </ButtonGroup>
    </>
  );
}

export default BookingDetail;
