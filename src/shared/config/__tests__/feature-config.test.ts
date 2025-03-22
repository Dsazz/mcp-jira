import { FeatureConfig } from '../feature-config.interface';

// Sample implementation of FeatureConfig for testing
class TestFeatureConfig implements FeatureConfig {
  // Properly implement readonly property with a getter
  #name: string;
  
  get name(): string {
    return this.#name;
  }
  
  private readonly apiKey?: string;
  private readonly apiUrl?: string;
  
  constructor(options: {
    name: string;
    apiKey?: string;
    apiUrl?: string;
  }) {
    this.#name = options.name;
    this.apiKey = options.apiKey;
    this.apiUrl = options.apiUrl;
  }
  
  isValid(): boolean {
    return !!this.apiKey && !!this.apiUrl;
  }
  
  getDiagnostics(): Record<string, unknown> {
    return {
      name: this.name,
      hasApiKey: !!this.apiKey,
      apiUrl: this.apiUrl,
      // Should NOT include the actual apiKey for security
    };
  }
}

describe('FeatureConfig Interface', () => {
  describe('TestFeatureConfig implementation', () => {
    it('should correctly identify valid configurations', () => {
      const validConfig = new TestFeatureConfig({
        name: 'test-feature',
        apiKey: 'secret-key',
        apiUrl: 'https://api.example.com'
      });
      
      expect(validConfig.isValid()).toBe(true);
    });
    
    it('should correctly identify invalid configurations', () => {
      const missingKeyConfig = new TestFeatureConfig({
        name: 'test-feature',
        apiUrl: 'https://api.example.com'
      });
      
      const missingUrlConfig = new TestFeatureConfig({
        name: 'test-feature',
        apiKey: 'secret-key'
      });
      
      const emptyConfig = new TestFeatureConfig({
        name: 'test-feature'
      });
      
      expect(missingKeyConfig.isValid()).toBe(false);
      expect(missingUrlConfig.isValid()).toBe(false);
      expect(emptyConfig.isValid()).toBe(false);
    });
    
    it('should provide diagnostics without exposing sensitive information', () => {
      const config = new TestFeatureConfig({
        name: 'test-feature',
        apiKey: 'secret-key',
        apiUrl: 'https://api.example.com'
      });
      
      const diagnostics = config.getDiagnostics();
      
      expect(diagnostics.name).toBe('test-feature');
      expect(diagnostics.hasApiKey).toBe(true);
      expect(diagnostics.apiUrl).toBe('https://api.example.com');
      
      // Should not expose actual API key
      expect(diagnostics.apiKey).toBeUndefined();
    });
    
    it('should expose readonly name property', () => {
      const name = 'test-feature';
      const config = new TestFeatureConfig({ name });
      
      expect(config.name).toBe(name);
      
      // Attempt to modify the property
      try {
        (config as any).name = 'new-name';
      } catch (e) {
        // Some environments might throw on this operation
      }
      
      // Value should remain unchanged due to the getter implementation
      expect(config.name).toBe(name);
    });
  });
}); 