import styled from "styled-components";
import Tag from "./../../ui/Tag";
import { Flag } from "./../../ui/Flag";
import Button from "./../../ui/Button";
import { Link } from "react-router-dom";
import CheckoutButton from "./CheckoutButton";

const StyledTodayItem = styled.li`
  display: grid;
  grid-template-columns: 10rem 0.8fr 2rem 5rem 11rem;
  gap: 2rem;
  align-items: center;

  font-size: 1.4rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--color-grey-100);

  &:first-child {
    border-top: 1px solid var(--color-grey-100);
  }
`;

const Guest = styled.div`
  font-weight: 500;
`;

function TodayItem({ activity }) {
  const { id, status, guests, numNights } = activity;
  return (
    <StyledTodayItem>
      {status === "unconfirmed" && <Tag type="green">Arriving</Tag>}
      {status === "checked-in" && <Tag type="blue">Departing</Tag>}
      <Guest>{guests.fullName}</Guest>
      <Flag src={guests.countryFlag} alt={`Flag of ${guests.country}`} />
      <div>{numNights}</div>

      {status === "unconfirmed" && (
        <Button
          $size="small"
          $variation="primary"
          as={Link}
          to={`/checkin/${id}`}
        >
          Check In
        </Button>
      )}

      {status === "checked-in" && (
        <CheckoutButton bookingId={id}></CheckoutButton>
      )}
    </StyledTodayItem>
  );
}

export default TodayItem;
