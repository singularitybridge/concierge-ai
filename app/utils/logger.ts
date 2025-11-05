/**
 * File-based Logger Utility
 *
 * Provides structured logging to files for debugging and monitoring.
 * Useful for tracking VAPI webhook calls, session data, and API interactions.
 */

import fs from 'fs';
import path from 'path';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  data?: any;
}

class Logger {
  private logsDir: string;

  constructor(logsDir: string = 'logs') {
    this.logsDir = path.join(process.cwd(), logsDir);
    this.ensureLogsDirectory();
  }

  private ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const dataStr = entry.data ? `\n${JSON.stringify(entry.data, null, 2)}` : '';
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.category}] ${entry.message}${dataStr}\n\n`;
  }

  private writeToFile(filename: string, content: string) {
    const filePath = path.join(this.logsDir, filename);
    fs.appendFileSync(filePath, content, 'utf8');
  }

  private log(level: LogEntry['level'], category: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data
    };

    // Write to category-specific file
    const filename = `${category}.log`;
    this.writeToFile(filename, this.formatLogEntry(entry));

    // Also log to console for development
    const consoleMsg = `[${category}] ${message}`;
    switch (level) {
      case 'info':
        console.log(consoleMsg, data || '');
        break;
      case 'warn':
        console.warn(consoleMsg, data || '');
        break;
      case 'error':
        console.error(consoleMsg, data || '');
        break;
      case 'debug':
        console.debug(consoleMsg, data || '');
        break;
    }
  }

  info(category: string, message: string, data?: any) {
    this.log('info', category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.log('warn', category, message, data);
  }

  error(category: string, message: string, data?: any) {
    this.log('error', category, message, data);
  }

  debug(category: string, message: string, data?: any) {
    this.log('debug', category, message, data);
  }

  /**
   * Log VAPI webhook requests with full payload
   */
  vapiWebhook(sessionId: string, payload: any) {
    this.info('vapi-webhook', `Session: ${sessionId}`, {
      sessionId,
      callId: payload.call?.id,
      caller: payload.call?.customer,
      toolCalls: payload.message?.toolCalls || payload.message?.toolCallList,
      fullPayload: payload
    });
  }

  /**
   * Log Agent Hub API calls
   */
  agentHubCall(sessionId: string, request: any, response?: any) {
    this.info('agent-hub', `Session: ${sessionId}`, {
      sessionId,
      request,
      response
    });
  }

  /**
   * Log session events
   */
  sessionEvent(sessionId: string, event: string, data?: any) {
    this.info('sessions', `${sessionId}: ${event}`, data);
  }

  /**
   * Clear old logs (older than specified days)
   */
  clearOldLogs(daysToKeep: number = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const files = fs.readdirSync(this.logsDir);
    files.forEach(file => {
      const filePath = path.join(this.logsDir, file);
      const stats = fs.statSync(filePath);

      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old log file: ${file}`);
      }
    });
  }

  /**
   * Get logs for a specific session
   */
  getSessionLogs(sessionId: string, category: string = 'vapi-webhook'): string[] {
    const filename = `${category}.log`;
    const filePath = path.join(this.logsDir, filename);

    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n\n');

    return lines.filter(line => line.includes(sessionId));
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for custom instances
export default Logger;
