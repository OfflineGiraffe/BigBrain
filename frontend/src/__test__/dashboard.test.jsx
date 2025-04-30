import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Dashboard from '../Dashboard';

// Mock the useNavigate hook properly
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: () => mockNavigate
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn()
  }
}));

describe('Dashboard Testing', () => {
  const mockToken = 'test-token';
  const mockSetActiveStatus = vi.fn();
  const mockGames = [
    {
      id: 1,
      name: 'Test Game',
      questions: [{},{}],
    }
  ];
  
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn().mockImplementation((key) => {
          if (key === 'email') return 'test@example.com';
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    });

    // Mock successful API responses
    axios.get.mockResolvedValue({ data: { games: [] } });
    axios.put.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Tests adding a game to the dashboard
  it('display game information after new game added', async () => {
    // Initial render with no games
    axios.get.mockResolvedValueOnce({ data: { games: [] } });
    
    render(
      <BrowserRouter>
        <Dashboard token={mockToken} activeStatus={false} setActiveStatus={mockSetActiveStatus} />
      </BrowserRouter>
    );

    // Check that "No Games Found" is initially displayed
    expect(screen.getByText('No Games Found.')).toBeInTheDocument();
    
    // Open the create game modal
    const createButton = screen.getByText('Create New Game');
    fireEvent.click(createButton);
    
    const nameInput = screen.getByPlaceholderText('Game Name');
    fireEvent.change(nameInput, { target: { value: 'Test Game' } });
    
    axios.get.mockResolvedValueOnce({ data: { games: mockGames } });
    axios.put.mockResolvedValueOnce({ data: { success: true } });
    
    const submitButton = screen.getByText('Create Game');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      // Check if game title is displayed
      expect(screen.getByText('Test Game')).toBeInTheDocument();
      
      // Check if number of questions is displayed (assuming GameCard displays this)
      expect(screen.getByText('Number of Questions')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      
    });
  });

  // Test is an error correctly shows up when adding a game
  it('shows error when creating a game with empty name', async () => {
    render(
      <BrowserRouter>
        <Dashboard token={mockToken} activeStatus={false} setActiveStatus={mockSetActiveStatus} />
      </BrowserRouter>
    );
    
    // Open the create game modal
    const createButton = screen.getByText('Create New Game');
    fireEvent.click(createButton);
    
    // Try to create game without name
    const submitButton = screen.getByText('Create Game');
    fireEvent.click(submitButton);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Game Name cannot be empty')).toBeInTheDocument();
    });
  });

  // Test deleting a game 
  it('should delete a game when delete button is clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: { games: mockGames } });
    
    render(
      <BrowserRouter>
        <Dashboard token={mockToken} activeStatus={false} setActiveStatus={mockSetActiveStatus} />
      </BrowserRouter>
    );
    
    // Wait for game to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Game')).toBeInTheDocument();
    });
    
    axios.get.mockResolvedValueOnce({ data: { games: [] } });
    axios.put.mockResolvedValueOnce({ data: { success: true } });
    
    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    // Check if "No Games Found" is displayed after deletion
    await waitFor(() => {
      expect(screen.getByText('No Games Found.')).toBeInTheDocument();
    });
  });
});