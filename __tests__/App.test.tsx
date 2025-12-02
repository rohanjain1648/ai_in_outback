import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />);
    const heading = screen.getByText('Rural Connect AI');
    expect(heading).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<App />);
    const description = screen.getByText(
      'Intelligent community platform for regional and rural Australia'
    );
    expect(description).toBeInTheDocument();
  });

  it('renders the setup complete message', () => {
    render(<App />);
    const message = screen.getByText(
      'Project setup complete! Ready for Three.js integration and feature development.'
    );
    expect(message).toBeInTheDocument();
  });
});