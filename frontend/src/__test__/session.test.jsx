import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import Session from '../Session';

// Mock the router hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ sessionId: 'test-session-123' }),
    useNavigate: () => vi.fn()
  };
});

// Mock axios
vi.mock('axios');


describe('Session Component', () => {
  const mockToken = 'test-token';
  const mockSetActiveStatus = vi.fn();
  
  // Setup localStorage mock
  let localStorageMock = {};
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Mock localStorage
    localStorageMock = {
      sessionId: 'test-session-123',
      token: mockToken,
      gameState: 'displayQuestions',
      currentQuestionPosition: '0',
      NumberOfQuestions: '5',
      questionTimer: '30',
      activeStatus: 'true'
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(key => localStorageMock[key] || null),
        setItem: vi.fn((key, value) => {
          localStorageMock[key] = value;
        }),
        removeItem: vi.fn(key => {
          delete localStorageMock[key];
        })
      },
      writable: true
    });

    // Mock alert
    window.alert = vi.fn();
  });

  afterEach(() => {
    // Clean up
    vi.restoreAllMocks();
  });

  it('renders waiting for players when gameState is waitForPlayersJoin', async () => {
    localStorageMock.gameState = 'waitForPlayersJoin';
    localStorageMock.currentQuestionPosition = '-1';
    
    render(
      <MemoryRouter>
        <Session token={mockToken} setActiveStatus={mockSetActiveStatus} />
      </MemoryRouter>
    );
    
    expect(await screen.findByText('Waiting for players to connect')).toBeInTheDocument();
  });

  it('renders questions display when gameState is displayQuestions', async () => {
    // Mock the getStatus response - this needs to be set up before rendering
    axios.get.mockImplementation((url) => {
      if (url.includes('/status')) {
        return Promise.resolve({
          data: {
            results: {
              questions: [
                { id: 1, text: 'Question 1', duration: 30, points: 10 },
                { id: 2, text: 'Question 2', duration: 30, points: 20 },
                { id: 3, text: 'Question 3', duration: 30, points: 30 },
                { id: 4, text: 'Question 4', duration: 30, points: 40 },
                { id: 5, text: 'Question 5', duration: 30, points: 50 }
              ]
            }
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
    
    render(
      <MemoryRouter>
        <Session token={mockToken} setActiveStatus={mockSetActiveStatus} />
      </MemoryRouter>
    );
    
    expect(await screen.findByText(/Question position: 1 \/ 5/)).toBeInTheDocument();
    expect(screen.getByText(/Duration: \d+s/)).toBeInTheDocument();
  });

  it('handles advancing to next question', async () => {
    // Mock implementations for axios calls
    axios.get.mockImplementation((url) => {
      if (url.includes('/games')) {
        return Promise.resolve({
          data: {
            games: [{ id: 'game-123', active: true }]
          }
        });
      } else if (url.includes('/status')) {
        return Promise.resolve({
          data: {
            results: {
              questions: [
                { id: 1, text: 'Question 1', duration: 30, points: 10 },
                { id: 2, text: 'Question 2', duration: 30, points: 20 },
                { id: 3, text: 'Question 3', duration: 30, points: 30 },
                { id: 4, text: 'Question 4', duration: 30, points: 40 },
                { id: 5, text: 'Question 5', duration: 30, points: 50 }
              ]
            }
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
    
    axios.post.mockResolvedValue({
      data: {
        data: {
          position: 1
        }
      }
    });
    
    render(
      <MemoryRouter>
        <Session token={mockToken} setActiveStatus={mockSetActiveStatus} />
      </MemoryRouter>
    );
    
    const nextButton = await screen.findByText('Next Question');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5005/admin/game/game-123/mutate',
        { mutationType: 'ADVANCE' },
        expect.any(Object)
      );
    });
  });

  it('handles ending the game', async () => {
    // Mock getGameIdResponse
    axios.get.mockImplementation((url) => {
      if (url.includes('/games')) {
        return Promise.resolve({
          data: {
            games: [{ id: 'game-123', active: true }]
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
    
    // Mock endGameMutate response
    axios.post.mockResolvedValue({});
    
    render(
      <MemoryRouter>
        <Session token={mockToken} setActiveStatus={mockSetActiveStatus} />
      </MemoryRouter>
    );
    
    const endButton = await screen.findByText('End Session');
    fireEvent.click(endButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5005/admin/game/game-123/mutate',
        { mutationType: 'END' },
        expect.any(Object)
      );
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('activeStatus');
    });
  });
});