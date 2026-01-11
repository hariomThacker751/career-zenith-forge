// ============= SECRET MANAGER WITH KEY ROTATION =============
// Manages multiple Gemini API keys with automatic rotation on rate limits

export interface KeyUsageStats {
  key: string;
  usageCount: number;
  lastUsed: number;
  rateLimitedUntil: number;
  errorCount: number;
}

class SecretManager {
  private keys: string[] = [];
  private keyStats: Map<string, KeyUsageStats> = new Map();
  private currentIndex: number = 0;

  constructor() {
    this.loadKeys();
  }

  private loadKeys(): void {
    // Load all available Gemini API keys from environment variables
    const keyNames = [
      "GEMINI_API_KEY",
      "GEMINI_API_KEY_1",
      "GEMINI_API_KEY_2",
      "GEMINI_API_KEY_3",
    ];

    for (const keyName of keyNames) {
      const key = Deno.env.get(keyName);
      if (key && key.trim() !== "") {
        this.keys.push(key);
        this.keyStats.set(key, {
          key: keyName, // Store the name for logging, not the actual key
          usageCount: 0,
          lastUsed: 0,
          rateLimitedUntil: 0,
          errorCount: 0,
        });
      }
    }

    if (this.keys.length === 0) {
      console.warn("No Gemini API keys found in environment");
    } else {
      console.log(`SecretManager initialized with ${this.keys.length} API key(s)`);
    }
  }

  /**
   * Get the next available API key using round-robin with rate limit awareness
   */
  getNextKey(): string | null {
    if (this.keys.length === 0) {
      return null;
    }

    const now = Date.now();
    let attempts = 0;
    const maxAttempts = this.keys.length;

    while (attempts < maxAttempts) {
      const key = this.keys[this.currentIndex];
      const stats = this.keyStats.get(key);

      // Check if key is rate limited
      if (stats && stats.rateLimitedUntil > now) {
        console.log(`Key ${this.currentIndex + 1} is rate limited, trying next...`);
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        attempts++;
        continue;
      }

      // Update stats
      if (stats) {
        stats.usageCount++;
        stats.lastUsed = now;
        this.keyStats.set(key, stats);
      }

      // Rotate to next key for next call
      const selectedIndex = this.currentIndex;
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;

      console.log(`Using API key ${selectedIndex + 1} of ${this.keys.length}`);
      return key;
    }

    // All keys are rate limited, return the one with shortest wait time
    console.warn("All API keys are rate limited, using the one with shortest wait");
    let shortestWait = Infinity;
    let bestKey = this.keys[0];

    for (const key of this.keys) {
      const stats = this.keyStats.get(key);
      if (stats && stats.rateLimitedUntil < shortestWait) {
        shortestWait = stats.rateLimitedUntil;
        bestKey = key;
      }
    }

    return bestKey;
  }

  /**
   * Mark a key as rate limited
   */
  markRateLimited(key: string, durationMs: number = 60000): void {
    const stats = this.keyStats.get(key);
    if (stats) {
      stats.rateLimitedUntil = Date.now() + durationMs;
      stats.errorCount++;
      this.keyStats.set(key, stats);
      console.log(`API key marked as rate limited for ${durationMs / 1000}s`);
    }
  }

  /**
   * Mark a key as having an error
   */
  markError(key: string): void {
    const stats = this.keyStats.get(key);
    if (stats) {
      stats.errorCount++;
      this.keyStats.set(key, stats);
    }
  }

  /**
   * Get usage statistics for all keys
   */
  getStats(): KeyUsageStats[] {
    return Array.from(this.keyStats.values());
  }

  /**
   * Get the count of available keys
   */
  getKeyCount(): number {
    return this.keys.length;
  }

  /**
   * Check if any keys are available
   */
  hasKeys(): boolean {
    return this.keys.length > 0;
  }

  /**
   * Get a specific key by environment variable name
   */
  getKeyByName(keyName: string): string | null {
    return Deno.env.get(keyName) || null;
  }
}

// Singleton instance
let secretManagerInstance: SecretManager | null = null;

export function getSecretManager(): SecretManager {
  if (!secretManagerInstance) {
    secretManagerInstance = new SecretManager();
  }
  return secretManagerInstance;
}

// Convenience function to get the next available key
export function getNextGeminiKey(): string {
  const manager = getSecretManager();
  const key = manager.getNextKey();
  if (!key) {
    throw new Error("No Gemini API keys configured. Please add GEMINI_API_KEY to your secrets.");
  }
  return key;
}

// Mark current key as rate limited and get next one
export function rotateOnRateLimit(currentKey: string): string {
  const manager = getSecretManager();
  manager.markRateLimited(currentKey);
  const nextKey = manager.getNextKey();
  if (!nextKey) {
    throw new Error("All API keys are rate limited. Please try again later.");
  }
  return nextKey;
}
