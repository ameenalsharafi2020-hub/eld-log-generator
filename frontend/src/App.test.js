import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ELD Generator title', () => {
  render(<App />);
  const titleElement = screen.getByText(/ELD Log Generator/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders input form', () => {
  render(<App />);
  const currentLocationInput = screen.getByLabelText(/Current Location/i);
  expect(currentLocationInput).toBeInTheDocument();
  
  const pickupLocationInput = screen.getByLabelText(/Pickup Location/i);
  expect(pickupLocationInput).toBeInTheDocument();
});