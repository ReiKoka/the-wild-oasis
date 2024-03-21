import CreateGuestForm from "../features/guests/CreateGuestForm";
import Heading from "../ui/Heading";
import SignupForm from "./../features/authentication/SignupForm";

function NewUsers() {
  return (
    <>
      <Heading as="h1">Create a new user</Heading>
      <SignupForm />
      <Heading as="h1">Create a new guest</Heading>
      <CreateGuestForm />
    </>
  );
}

export default NewUsers;
