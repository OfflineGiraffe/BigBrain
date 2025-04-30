import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import EditGame from '../EditGame';

// Mock the useNavigate and useParams hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: () => mockNavigate,
  useParams: () => ({ gameId: '1' })
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn()
  }
}));

describe('Display Questions Component', () => {
  const mockToken = 'test-token';
  // Mock Game and Questions Data
  const mockGame = {
    id: 1,
    name: 'Test Game',
    thumbnail: 'data:image/png;base64,test',
    questions: [
      {
        id: 1,
        question: 'Test Question 1',
        duration: 30,
        points: 5,
        questionType: 'Single Choice',
        answers: ['Answer A', 'Answer B', 'Answer C'],
        correctAnswers: ['Option A']
      },
      {
        id: 2,
        question: 'Test Question 2',
        duration: 15,
        points: 3,
        questionType: 'Multiple Choice',
        answers: ['Answer X', 'Answer Y', 'Answer Z'],
        correctAnswers: ['Option A', 'Option B'],
        attachmentType: 'youtube',
        attachment: 'https://www.youtube.com/embed/test'
      }
    ]
  };
  
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    });

    axios.get.mockResolvedValue({ data: { games: [mockGame] } });
    axios.put.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test if game info is shown correctly
  it('shows game information correctly', async () => {
    render(
      <BrowserRouter>
        <EditGame token={mockToken} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Game')).toBeInTheDocument();
      expect(screen.getByText('Number of Questions: 2')).toBeInTheDocument();
      expect(screen.getByText(/Total Duration:/)).toBeInTheDocument();
    });
  });

  // Test if questions are shown correctly
  it('shows all questions correctly', async () => {
    render(
      <BrowserRouter>
        <EditGame token={mockToken} />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Checks that both questions are on the page
      expect(screen.getByText('Test Question 1')).toBeInTheDocument();
      expect(screen.getByText('Test Question 2')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getAllByText('seconds')).toHaveLength(2);
    });
  });

  // Test deleting a question
  it('deletes a question when delete button is clicked', async () => {
    const updatedGame = {
      ...mockGame,
      questions: [mockGame.questions[1]]
    };
    
    axios.get.mockResolvedValueOnce({ data: { games: [mockGame] } });
    axios.put.mockResolvedValueOnce({ data: { success: true } });
    axios.get.mockResolvedValueOnce({ data: { games: [updatedGame] } });

    render(
      <BrowserRouter>
        <EditGame token={mockToken} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Question 1')).toBeInTheDocument();
    });

    // click the delete button for the first question
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Check if the question was removed after deletion
    await waitFor(() => {
      expect(screen.queryByText('Test Question 1')).not.toBeInTheDocument();
      expect(screen.getByText('Test Question 2')).toBeInTheDocument();
    });

    expect(axios.put).toHaveBeenCalledWith(
      'http://localhost:5005/admin/games',
      expect.anything(),
      expect.anything()
    );
  });

  // Test display when there are no questions available
  it('displays correctly when game has no questions', async () => {
    const emptyGame = {
      ...mockGame,
      questions: []
    };
    
    axios.get.mockResolvedValueOnce({ data: { games: [emptyGame] } });

    render(
      <BrowserRouter>
        <EditGame token={mockToken} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No Questions Found.')).toBeInTheDocument();
    });
  });

  // Test removing a question attachment
  it('correctly removes the question attachment of a question', async () => {
    render(
      <BrowserRouter>
        <EditGame token={mockToken} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Game Info')).toBeInTheDocument();
    });

    // Find and click the remove attachment button
    const removeAttachmentButton = screen.getByText('Remove Attachment');
    fireEvent.click(removeAttachmentButton);
    
    // Check for a call to update the game
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:5005/admin/games',
        expect.anything(),
        expect.anything()
      );
    });
  });
});