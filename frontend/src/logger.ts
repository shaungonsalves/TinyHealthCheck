type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private level: LogLevel = 'info';

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private log(level: LogLevel, ...args: any[]) {
    if (this.shouldLog(level)) {
      const timestamp = new Date().toISOString();
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      const logEntry = {
        level,
        time: timestamp,
        msg: message,
        ...(args.length === 1 && args[0] && typeof args[0] === 'object' 
            ? { ...args[0] } 
            : {})
      };
      
      const consoleMethod = level === 'error' ? 'error' 
                          : level === 'warn' ? 'warn' 
                          : 'log';
      console[consoleMethod](JSON.stringify(logEntry));
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  debug(...args: any[]) { this.log('debug', ...args); }
  info(...args: any[]) { this.log('info', ...args); }
  warn(...args: any[]) { this.log('warn', ...args); }
  error(...args: any[]) { this.log('error', ...args); }
}

export const logger = new Logger();