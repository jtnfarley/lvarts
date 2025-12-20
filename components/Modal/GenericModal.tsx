import Modal from "./Modal";

export default function GenericModal(props:{
    title:string,
    message: string,
    isOpen:boolean, 
    onClose:() => void, 
    children:any
}) {
    const { title, message, isOpen, onClose, children } = props;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
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
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>
        </Modal>
    );
};