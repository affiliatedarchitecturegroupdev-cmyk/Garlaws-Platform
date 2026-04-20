import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ComponentStory {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  props: Record<string, any>;
  code: string;
  category: string;
  tags: string[];
  lastUpdated: Date;
}

interface StorybookViewerProps {
  stories?: ComponentStory[];
  onStorySelect?: (story: ComponentStory) => void;
  className?: string;
}

export function StorybookViewer({
  stories = [],
  onStorySelect,
  className,
}: StorybookViewerProps) {
  const [selectedStory, setSelectedStory] = useState<ComponentStory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock stories for demonstration
  const mockStories: ComponentStory[] = [
    {
      id: 'button-primary',
      title: 'Primary Button',
      description: 'A primary call-to-action button with hover effects',
      component: React.Fragment, // Would be actual Button component
      props: { variant: 'primary', children: 'Click me' },
      code: `<Button variant="primary">Click me</Button>`,
      category: 'Buttons',
      tags: ['interactive', 'primary', 'cta'],
      lastUpdated: new Date('2026-04-20'),
    },
    {
      id: 'input-text',
      title: 'Text Input',
      description: 'Standard text input with validation states',
      component: React.Fragment,
      props: { type: 'text', placeholder: 'Enter text', error: false },
      code: `<Input type="text" placeholder="Enter text" />`,
      category: 'Forms',
      tags: ['form', 'input', 'validation'],
      lastUpdated: new Date('2026-04-19'),
    },
    {
      id: 'card-basic',
      title: 'Basic Card',
      description: 'Simple card component for content display',
      component: React.Fragment,
      props: { title: 'Card Title', children: 'Card content' },
      code: `<Card title="Card Title">Card content</Card>`,
      category: 'Layout',
      tags: ['card', 'layout', 'content'],
      lastUpdated: new Date('2026-04-18'),
    },
  ];

  const allStories = stories.length > 0 ? stories : mockStories;
  const categories = Array.from(new Set(allStories.map(s => s.category)));

  const filteredStories = allStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || story.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStorySelect = useCallback((story: ComponentStory) => {
    setSelectedStory(story);
    onStorySelect?.(story);
  }, [onStorySelect]);

  const copyCodeToClipboard = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      // Could show a toast notification here
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }, []);

  return (
    <div className={cn('flex h-screen bg-background', className)}>
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold mb-4">Component Library</h2>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stories List */}
        <div className="flex-1 overflow-y-auto">
          {filteredStories.map(story => (
            <div
              key={story.id}
              onClick={() => handleStorySelect(story)}
              className={cn(
                'p-4 border-b border-border cursor-pointer hover:bg-muted/50',
                selectedStory?.id === story.id && 'bg-muted'
              )}
            >
              <h3 className="font-medium text-sm">{story.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {story.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">{story.category}</span>
                <div className="flex gap-1">
                  {story.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-muted rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedStory ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{selectedStory.title}</h1>
                  <p className="text-muted-foreground mt-1">{selectedStory.description}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>Last updated: {selectedStory.lastUpdated.toLocaleDateString()}</div>
                  <div>Category: {selectedStory.category}</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-2 mt-4">
                {selectedStory.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Canvas */}
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold mb-4">Preview</h2>
                <div className="bg-white border border-border rounded-lg p-8 min-h-[300px] flex items-center justify-center">
                  {/* Component would render here */}
                  <div className="text-muted-foreground">
                    Component preview would render here
                  </div>
                </div>
              </div>

              {/* Props */}
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold mb-4">Props</h2>
                <div className="space-y-3">
                  {Object.entries(selectedStory.props).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded">
                      <span className="font-mono text-sm">{key}</span>
                      <span className="text-sm text-muted-foreground">
                        {typeof value === 'string' ? `"${value}"` : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Code</h2>
                  <button
                    onClick={() => copyCodeToClipboard(selectedStory.code)}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                  >
                    Copy Code
                  </button>
                </div>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm font-mono">{selectedStory.code}</code>
                </pre>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Select a Component</h2>
              <p className="text-muted-foreground">
                Choose a component from the sidebar to view its documentation and examples.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}