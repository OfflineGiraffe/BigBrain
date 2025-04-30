import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewResultsModal from '../../components/ViewResultsModal';

describe('ViewResultsModal', () => {
  it('renders modal with children when open is true', () => {
    render(
      <ViewResultsModal open={true} onClose={() => {}}>
        <div>Modal Content</div>
      </ViewResultsModal>
    );

    expect(screen.getByText('Modal Content')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('does not render modal content when open is false', () => {
    render(
      <ViewResultsModal open={false} onClose={() => {}}>
        <div>Hidden Content</div>
      </ViewResultsModal>
    );

    const modal = screen.getByText('Close').parentElement;
    expect(modal).toHaveClass('invisible');
  });

  it('calls onClose when Close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <ViewResultsModal open={true} onClose={onCloseMock}>
        <div>Testing close</div>
      </ViewResultsModal>
    );

    fireEvent.click(screen.getByText('Close'));
    expect(onCloseMock).toHaveBeenCalled();
  });
});
