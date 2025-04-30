
const DisplayQuestions = ({question, onEdit, onDelete, onRemoveAttachment}) => {

  const getOptionLabel = (index) => `Option ${String.fromCharCode(65 + index)}`;
  const getOptionClass = (label) => {
    return question.correctAnswers.includes(label)
      ? 'bg-lime-300 text-green-950'
      : 'bg-rose-200 text-red-950';
  };

  return (
    <ul className="list bg-base-100 rounded-box shadow-md mt-4 mb-0 !pl-0"> 
      <li className="list-row">
        <div className="flex flex-col justify-between h-full text-center border-r border-gray-300 pr-4">
          <div>
            <div className="text-3xl font-thin tabular-nums">{question.duration}</div>
            <div className="text-sm font-thin tabular-nums">
              {Number(question.duration) === 1 ? 'second' : 'seconds'}
            </div>
          </div>
          <div>
            <div className="text-3xl font-thin tabular-nums">{question.points}</div>
            <div className="text-sm font-thin tabular-nums">
              {Number(question.points) === 1 ? 'point' : 'points'}
            </div>
          </div>
        </div>
        <div className="list-col-grow">
          <div className="text-lg">{question.question}</div>

          {question.answers.map((answerText, index) => {
            const label = getOptionLabel(index);
            return (
              <div key={label}>
                <div className="input-group mt-2 mb-1">
                  <span className={`rounded-md px-0 sm:!px-4 py-0 text-gray-600 ${getOptionClass(label)}`}>
                    {label}
                  </span>
                </div>
                <div className="text-xs font-semibold opacity-80 ml-4">{answerText}</div>
              </div>
            );
          })}
          {question.attachmentType === 'image' && question.attachment && (
            <>
              <div data-testid="question-attachment-title" className="text-sm font-semibold mt-6">Question Attachment</div>
              <img
                src={question.attachment}
                alt="Question attachment"
                className="shadow-2xl rounded-lg w-full sm:w-[20%] mt-2"
              />
            </>
          )}
          {question.attachmentType === 'youtube' && question.attachment && (
            <>
              <div data-testid="question-attachment-title" className="text-sm font-semibold mt-6">Question Attachment</div>
              <iframe
                className="mt-2 mb-6 w-full sm:w-[85%] md:w-[70%] lg:w-[55%] xl:w-[40%] h-[125px] sm:h-[150px] md:h-[200px] lg:h-[350px] xl:h-[400px]"
                src={question.attachment}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </>
          )}
        </div>
        <div className='join join-vertical gap-2 border-l border-gray-300 pl-4 w-[100px] sm:!w-[150px] sm:!w-[250px]'>
          <button onClick={onEdit} className="btn btn-primary w-full !text-xs sm:!text-md lg:!text-lg">Edit Question</button>
          <button type="button" onClick={onDelete} className="btn btn-danger !bg-red-600 hover:!bg-red-900 w-full !text-xs sm:!text-md lg:!text-lg">Delete Question</button>
          {question.attachment && (
            <button onClick={onRemoveAttachment} className="btn text-white !bg-zinc-500 hover:!bg-zinc-600 w-full !text-xs sm:!text-md lg:!text-lg">Remove Attachment</button>
          )}
        </div>
      </li>
            
    </ul> 
  )
    
}

export default DisplayQuestions;