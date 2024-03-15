import styled from "styled-components";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import { CreateCabinForm } from "./CreateCabinForm";

// function AddCabin() {
//   const [isOpenModal, setIsOpenModal] = useState(false);

//   return (
//     <div>
//       <Button onClick={() => setIsOpenModal((show) => !show)}>
//         Add new cabin
//       </Button>
//       {isOpenModal && (
//         <Modal onClose={() => setIsOpenModal(false)}>
//           <CreateCabinForm onCloseModal={() => setIsOpenModal(false)}/>
//         </Modal>
//       )}
//     </div>
//   );
// }

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
`

function AddCabin() {
  return (
    <StyledDiv>
      <Modal>
        <Modal.Open opens="cabin-form">
          <Button>Add new cabin</Button>
        </Modal.Open>
        <Modal.Window name="cabin-form">
          <CreateCabinForm />
        </Modal.Window>
      </Modal>
    </StyledDiv>
  );
}

export default AddCabin;
