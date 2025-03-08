import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { 

Card, 
CardHeader, 
CardTitle, 
CardDescription, 
CardContent, 
CardFooter 
} from '@/components/ui/card';

describe('C./../ard Components', () => {
// Test Card component
describe('Card', () => {
    it('should render correctly with default props', () => {
        render(<Card data-testid="card">Card Content</Card>);
        const card = screen.getByTestId('card');
        expect(card).toBeInTheDocument();
        expect(card).toHaveTextContent('Card Content');
        expect(card.className).toContain('rounded-lg border bg-card text-card-foreground shadow-sm');
    });

    it('should merge custom className with default classes', () => {
        render(<Card data-testid="card" className="custom-class">Card Content</Card>);
        const card = screen.getByTestId('card');
        expect(card.className).toContain('rounded-lg');
        expect(card.className).toContain('custom-class');
    });
});

// Test CardHeader component
describe('CardHeader', () => {
    it('should render correctly with default props', () => {
        render(<CardHeader data-testid="header">Header Content</CardHeader>);
        const header = screen.getByTestId('header');
        expect(header).toBeInTheDocument();
        expect(header.className).toContain('flex flex-col space-y-1.5 p-6');
    });
});

// Test CardTitle component
describe('CardTitle', () => {
    it('should render correctly with default props', () => {
        render(<CardTitle data-testid="title">Title Content</CardTitle>);
        const title = screen.getByTestId('title');
        expect(title).toBeInTheDocument();
        expect(title.className).toContain('text-2xl font-semibold leading-none tracking-tight');
    });
});

// Test CardDescription component
describe('CardDescription', () => {
    it('should render correctly with default props', () => {
        render(<CardDescription data-testid="description">Description Content</CardDescription>);
        const description = screen.getByTestId('description');
        expect(description).toBeInTheDocument();
        expect(description.className).toContain('text-sm text-muted-foreground');
    });
});

// Test CardContent component
describe('CardContent', () => {
    it('should render correctly with default props', () => {
        render(<CardContent data-testid="content">Content</CardContent>);
        const content = screen.getByTestId('content');
        expect(content).toBeInTheDocument();
        expect(content.className).toContain('p-6 pt-0');
    });
});

// Test CardFooter component
describe('CardFooter', () => {
    it('should render correctly with default props', () => {
        render(<CardFooter data-testid="footer">Footer Content</CardFooter>);
        const footer = screen.getByTestId('footer');
        expect(footer).toBeInTheDocument();
        expect(footer.className).toContain('flex items-center p-6 pt-0');
    });
});

// Test composition
describe('Card Component Integration', () => {
    it('should compose all card components together', () => {
        render(
            <Card data-testid="card">
                <CardHeader data-testid="header">
                    <CardTitle data-testid="title">Card Title</CardTitle>
                    <CardDescription data-testid="description">Card Description</CardDescription>
                </CardHeader>
                <CardContent data-testid="content">Card Content</CardContent>
                <CardFooter data-testid="footer">Card Footer</CardFooter>
            </Card>
        );

        expect(screen.getByTestId('card')).toBeInTheDocument();
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('title')).toHaveTextContent('Card Title');
        expect(screen.getByTestId('description')).toHaveTextContent('Card Description');
        expect(screen.getByTestId('content')).toHaveTextContent('Card Content');
        expect(screen.getByTestId('footer')).toHaveTextContent('Card Footer');
    });
});
});