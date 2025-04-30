import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateQuestionModal from '../../components/CreateQuestionModal';

describe('CreateQuestionModal', () => {
  // Add the props needed for each call of the CreateQuestionModal elements
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onCreate: vi.fn(),
    onEdit: vi.fn(),
    error: '',
    duration: '',
    setDuration: vi.fn(),
    points: '',
    setPoints: vi.fn(),
    question: '',
    setQuestion: vi.fn(),
    options: [
      { label: 'A', value: '' },
      { label: 'B', value: '' }
    ],
    setOptions: vi.fn(),
    correctAnswer: '',
    setCorrectAnswer: vi.fn(),
    correctAnswers: [],
    setCorrectAnswers: vi.fn(),
    questionType: '',
    setQuestionType: vi.fn(),
    editing: false,
    setAnswers: vi.fn(),
    questionFileInputRef: { current: null },
    handleFileChange: vi.fn(),
    youtubeUrl: '',
    setYoutubeUrl: vi.fn(),
    attachmentType: '',
    setAttachmentType: vi.fn(),
    editQuestion: null
  };

  // Reset for each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Checks if the duration can be set
  it('Set duration of question', () => {
    const setDuration = vi.fn();
    render(<CreateQuestionModal {...defaultProps} setDuration={setDuration} />);
    
    const durationInput = screen.getByPlaceholderText('Duration in Seconds');
    fireEvent.change(durationInput, { target: { value: '30' } });
    
    expect(setDuration).toHaveBeenCalledWith('30');
  });

  // Test when judgement type is clicked
  it('Shows the judgement question type outputs', () => {
    render(
      <CreateQuestionModal 
        {...defaultProps} 
        questionType="Judgement"
      />
    );
    
    expect(screen.getByText('Select the Correct Answer')).toBeInTheDocument();
    expect(screen.getByText('True')).toBeInTheDocument();
    expect(screen.getByText('False')).toBeInTheDocument();
  });

  // Test when single choice type is clicked
  it('Shows the single choice question type outputs', () => {
    render(
      <CreateQuestionModal 
        {...defaultProps} 
        questionType="Single Choice" 
        options={[
          { label: 'A', value: 'Answer A' },
          { label: 'B', value: 'Answer B' }
        ]}
      />
    );
    
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Answer Displayed as Option A')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Answer Displayed as Option B')).toBeInTheDocument();
  });

  // Test when multiple choice type is clicked
  it('Shows the multiple choice question type outputs', () => {
    render(
      <CreateQuestionModal 
        {...defaultProps} 
        questionType="Multiple Choice" 
        options={[
          { label: 'A', value: 'Answer A' },
          { label: 'B', value: 'Answer B' }
        ]}
      />
    );
    
    // Check that checkboxes are there instead of radio buttons
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(2);
  });

  // Test clicking on youtube url button for question attachment
  it('shows URL input when youtube attachment type is selected', () => {
    render(
      <CreateQuestionModal 
        {...defaultProps} 
        attachmentType="youtube"
      />
    );
    
    expect(screen.getByRole('button', { name: 'YouTube URL' })).toHaveClass('!btn-primary');
    expect(screen.getByRole('button', { name: 'Upload Image' })).not.toHaveClass('!btn-primary');
    expect(screen.getByPlaceholderText('YouTube Video URL')).toBeInTheDocument();
  });

  // Shows different title and buttons when adding and editing questions
  it('shows correct button text for add vs edit mode', () => {
    const { rerender } = render(<CreateQuestionModal {...defaultProps} editing={false} />);
    expect(screen.getByText('Add Question', { selector: 'button' })).toBeInTheDocument();
    
    const editQuestion = {
        questionType: "Judgement",
        answers: ['a', 'b'],
        correctAnswers: ['Optiobn A']
    }
    rerender(<CreateQuestionModal {...defaultProps} editing={true} editQuestion={editQuestion}/>);
    expect(screen.getByText('Edit Question', { selector: 'button' })).toBeInTheDocument();
  });

  // Test form sumbission when add question button is clicked
  it('calls onCreate when Add Question button is clicked', () => {
    const onCreate = vi.fn();
    render(<CreateQuestionModal {...defaultProps} onCreate={onCreate} />);
    
    fireEvent.click(screen.getByText('Add Question', { selector: 'button' }));
    expect(onCreate).toHaveBeenCalled();
  });

  // Test that an error is shown on the screen
  it('displays error message when provided', () => {
    render(<CreateQuestionModal {...defaultProps} error="This is an error message" />);
    expect(screen.getByText('This is an error message')).toBeInTheDocument();
  });
});