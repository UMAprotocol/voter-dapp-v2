import { Modal, ModalProps } from "./Modal";

type Props = ModalProps;

export function MultipleValuesInputModal(props: Props) {
  return (
    <Modal {...props}>
      <div className="flex flex-col"></div>
    </Modal>
  );
}
