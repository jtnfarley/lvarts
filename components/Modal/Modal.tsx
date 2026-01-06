export default function Modal(props:{isOpen:boolean, onClose:() => void, children:any}) {
    const { isOpen, onClose, children } = props;

    if (!isOpen) return null;

    return (
        <div className="absolute -left-60 -top-60 flex
                        items-center justify-center
                        z-21">
            <div className="bg-white rounded-lg
                            shadow-lg p-6 max-w-md
                            w-full relative">
                <button
                    className="absolute top-2 right-2
                               text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    &#x2715; {/* Close button */}
                </button>
                {children}
            </div>
        </div>
    );
};
