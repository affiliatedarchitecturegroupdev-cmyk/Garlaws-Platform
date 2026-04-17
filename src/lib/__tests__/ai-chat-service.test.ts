import { aiChatService } from '@/lib/ai-chat-service';

describe('AI Chat Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateResponse', () => {
    it('should respond to greetings', async () => {
      const response = await aiChatService.generateResponse('hello');
      expect(response.message).toBeDefined();
      expect(typeof response.message).toBe('string');
    });

    it('should handle booking queries', async () => {
      const response = await aiChatService.generateResponse('I want to book a service');
      expect(response.message).toContain('happy to help');
      expect(response.suggestions).toBeDefined();
      expect(response.actions).toBeDefined();
    });

    it('should handle support queries', async () => {
      const response = await aiChatService.generateResponse('I need help');
      expect(response.message).toContain('help');
      expect(response.suggestions).toBeDefined();
    });

    it('should provide default response for unknown queries', async () => {
      const response = await aiChatService.generateResponse('xyz123');
      expect(response.message).toContain('not sure');
      expect(response.suggestions).toBeDefined();
      expect(response.actions).toBeDefined();
    });
  });
});