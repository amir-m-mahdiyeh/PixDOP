export class BootManager {
  constructor() {
    this.tasks = [];
    this.completed = 0;

    this.onProgress = null;
    this.onComplete = null;
  }

  addTask(name, task) {
    if (typeof task !== "function") {
      throw new TypeError(`Boot task "${name}" must be a function.`);
    }

    this.tasks.push({
      name,
      task,
    });

    return this;
  }

  async start() {
    const total = this.tasks.length;
    if (total === 0) {
      this.onProgress?.(100);
      await this.onComplete?.([]);
      return [];
    }

    const results = [];
    for (const { name, task } of this.tasks) {
      try {
        const result = await task();
        results.push({ status: "fulfilled", value: result });
      } catch (error) {
        results.push({ status: "rejected", reason: error });
        console.warn(`Boot task failed: ${name}`, error);
      }
      this.completed++;
      this.reportProgress(total, name);
    }

    await this.onComplete?.(results);
    return results;
  }

  reportProgress(total, taskName) {
    const percent = Math.round((this.completed / total) * 100);

    this.onProgress?.(percent, taskName);
  }
}
