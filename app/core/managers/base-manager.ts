export class BaseManager {
  protected listeners = new Set<() => void>();

  protected notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  addListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
