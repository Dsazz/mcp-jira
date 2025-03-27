import type { FeatureConfig } from "../../feature-config.interface";

export class TestFeatureConfig implements FeatureConfig {
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
    };
  }
}
