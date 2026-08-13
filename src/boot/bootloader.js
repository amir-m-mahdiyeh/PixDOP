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

    const results = await Promise.all(
      this.tasks.map(async ({ name, task }) => {
        try {
          const value = await task();

          this.completed++;
          this.reportProgress(total, name);

          return {
            name,
            status: "fulfilled",
            value,
          };
        } catch (error) {
          console.error(`Boot task failed: ${name}`, error);

          this.completed++;
          this.reportProgress(total, name);

          return {
            name,
            status: "rejected",
            reason: error,
          };
        }
      }),
    );

    await this.onComplete?.(results);

    return results;
  }

  reportProgress(total, taskName) {
    const percent = Math.round((this.completed / total) * 100);

    this.onProgress?.(percent, taskName);
  }
}
