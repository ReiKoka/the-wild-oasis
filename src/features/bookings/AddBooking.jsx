import styled from "styled-components";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import CreateBookingForm from "./CreateBookingForm";

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
`;

function AddBooking() {
  return (
    <StyledDiv>
      <Modal>
        <Modal.Open opens="booking-form">
          <Button>Add new booking</Button>
        </Modal.Open>
        <Modal.Window name="booking-form">
          <CreateBookingForm />
        </Modal.Window>
      </Modal>
    </StyledDiv>
  );
}

export default AddBooking;
