import SortBy from "../../ui/SortBy";
import Filter from "../../ui/Filter";
import TableOperations from "../../ui/TableOperations";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import CreateBookingForm from "./CreateBookingForm";

function BookingTableOperations() {
  return (
    <>
      <TableOperations>
        <Filter
          filterField="status"
          options={[
            { value: "all", label: "All" },
            { value: "checked-out", label: "Checked out" },
            { value: "checked-in", label: "Checked in" },
            { value: "unconfirmed", label: "Unconfirmed" },
          ]}
        />

        <SortBy
          options={[
            { value: "startDate-desc", label: "Sort by date (recent first)" },
            { value: "startDate-asc", label: "Sort by date (earlier first)" },
            {
              value: "totalPrice-desc",
              label: "Sort by amount (high first)",
            },
            { value: "totalPrice-asc", label: "Sort by amount (low first)" },
          ]}
        />
      </TableOperations>
      <Modal>
        <Modal.Open opens="booking-form">
          <Button>Add new booking</Button>
        </Modal.Open>
        <Modal.Window name="booking-form">
          <CreateBookingForm />
        </Modal.Window>
      </Modal>
    </>
  );
}

export default BookingTableOperations;
