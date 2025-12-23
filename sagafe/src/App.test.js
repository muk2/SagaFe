import { render, screen } from '@testing-library/react';
import {App, ItemList} from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});


test('renders items list title', async () => {
    render(<ItemList />);
    const titleElement = screen.getByText(/Items from PostgreSQL/i); 
    expect(titleElement).toBeInTheDocument();
});

