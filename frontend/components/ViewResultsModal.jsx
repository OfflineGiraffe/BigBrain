import Button from "react-bootstrap/esm/Button";

function ViewResultsModal ({open, onClose, children}) {

  return (
    <div className={`fixed z-50 inset-0 flex flex-col justify-center items-center transition-colors ${open ? "visible bg-black/60" : "invisible"}`}>
            
      <div className={`max-h-[45vh] overflow-auto bg-white roudned-lg shadow p-6 transition all max-w-md overflow-auto ${open ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}>
        <div className="flex flex-col">
          {/* display the children of the parent component */}
          {children}
        </div>
      </div>
      <Button
        onClick={onClose}
        variant="danger"
        className="btn !bg-red-600 text-white mt-2">
          Close
      </Button>
    </div>
  )
};

export default ViewResultsModal;