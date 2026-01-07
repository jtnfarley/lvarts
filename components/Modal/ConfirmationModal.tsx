import Modal from "./Modal";
import { useModal } from '@/app/contextProviders/modalProvider'

export default function ConfirmationModal(props:{
    title:string,
    message: string,
    isOpen:boolean, 
    children:any
}) {
    const { title, message, isOpen, children } = props;
    const { setIsOpen, triggerAction } = useModal()

    return (
        <Modal isOpen={isOpen}>
            <h2 className="text-lg font-bold"> 
                {title}
            </h2>
            <p className="text-black text-lg">
                {message}
            </p>
            
            {children}
            
            <div className="flex justify-end
                            space-x-4 mt-4">
                <button
                    className="px-4 py-2 bg-gray-500
                               text-white rounded-lg text-base"
                    onClick={() => setIsOpen(false)}
                >
                    Cancel
                </button>
                <button
                    className="px-4 py-2 bg-red-500
                               text-white rounded-lg text-base"
                    onClick={() => triggerAction()}
                >
                    Confirm
                </button>
            </div>
        </Modal>
    );
};