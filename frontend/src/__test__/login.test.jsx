import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login from '../Login';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Helper to wrap in Router (needed for `useNavigate` and `Link`)
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Login Component', () => {
  it('renders inputs and button', () => {
    renderWithRouter(<Login token={null} successJob={vi.fn()} />);
    
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('calls login and successJob on valid input', async () => {
    const mockSuccessJob = vi.fn();
    const mockToken = 'mock-token';

    // mock resolved axios.post
    axios.post.mockResolvedValueOnce({ data: { token: mockToken } });

    renderWithRouter(<Login token={null} successJob={mockSuccessJob} />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'user@example.com' }
    });

    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockSuccessJob).toHaveBeenCalledWith(mockToken, 'user@example.com', 'password123');
    });
  });

  it('shows error message on failed login', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } }
    });

    renderWithRouter(<Login token={null} successJob={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'wrong@example.com' }
    });

    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrongpass' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
    });
  });
});
