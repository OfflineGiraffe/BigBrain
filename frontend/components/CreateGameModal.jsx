// Creates a popup for when the user wants to create a new game

function CreateGameModal ({open, onClose, onCreate, name, setName, handleFileChange, error, editing, fileInputRef}) {

  return (
  // Displays a transparent grey background for the modal
    <div className={`fixed z-50 inset-0 flex flex-col justify-center items-center transition-colors ${open ? "visible bg-black/60" : "invisible"}`}>
      <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box bg-white">
        {editing ? (<legend className="fieldset-legend text-center text-3xl">Edit Game</legend>):
          <legend className="fieldset-legend text-center text-3xl">Create a New Game</legend>}
        <label className="fieldset-label text-slate-900">Game Name</label>
        <input
          className="p-2 bg-gray-200 rounded-md"
          type="text"
          placeholder="Game Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="fieldset-label text-slate-900">Game Thumbnail</label>
        <input ref={fileInputRef} type="file" className="file-input" accept="image/*" onChange={handleFileChange}/>

        {/* Only shows when an error has been stored */}
        {error && (
          <div role="alert" className="alert alert-warning mt-2 mb-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Submits the form to create a new game */}
        {editing ? (<button onClick={onCreate} data-testid="edit-game-main" className="btn btn-primary md:btn-md flex-1 mt-2">Edit Game</button>):
          <button name="create game" onClick={onCreate} className="btn btn-primary md:btn-md flex-1 mt-2">Create Game</button>}

      </fieldset>
      {/* Exits the modal without creating a new game */}
      <button onClick={onClose} className="btn !bg-red-600 text-white mt-2">Close</button>
    </div>
  )
};

export default CreateGameModal;