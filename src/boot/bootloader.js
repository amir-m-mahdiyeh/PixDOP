export class BootManager {
  constructor() {
    this.tasks = [];
    this.total = 0;
    this.completed = 0;
    this.onProgress = null;
  }

  addTask(name, promise) {
    this.total++;
    const wrapped = promise
      .then((result) => {
        this.completed++;
        const percent = Math.round((this.completed / this.total) * 100);
        if (this.onProgress) this.onProgress(percent, name);
        return result;
      })
      .catch((err) => {
        this.completed++;
        const percent = Math.round((this.completed / this.total) * 100);
        if (this.onProgress) this.onProgress(percent, `${name} (failed)`);
        console.warn(`Boot task failed: ${name}`, err);
        return null;
      });
    this.tasks.push(wrapped);
    return this;
  }

  async start() {
    return Promise.allSettled(this.tasks);
  }
}
