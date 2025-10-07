/**
 * @copyright nhcarrigan
 * @license Naomi's Public License
 * @author Naomi Carrigan
 */

import type { Level } from "./types/level.js";

/**
 * This is a wrapper around our custom alert monitoring server. This class
 * allows you to pipe errors and log messages to our server.
 */
export class Logger {
  private readonly url: string;

  /**
   * Instantiates the class.
   * @param application -- The name of the application (this will appear in logs).
   * @param token -- Your API token for the monitoring service.
   * @param url -- (Optional) The URL for your own alerting instance.
   */
  public constructor(
    private readonly application: string,
    private readonly token: string,
    url?: string,
  ) {
    this.url = url ?? "https://alerts.nhcarrigan.com";
  }

  /**
   * Sends a log message to the alerting service.
   * @param level -- The level of the log message.
   * @param message -- The message to send.
   */
  public async log(level: Level, message: string): Promise<void> {
    await fetch(`${this.url}/log`, {
      body: JSON.stringify({
        application: this.application,
        level:       level,
        message:     message,
      }),
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Standard header name.
        "Authorization": this.token,
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Standard header name.
        "Content-Type":  "application/json",
      },
      method: "POST",
    });
  }

  /**
   * Sends an error to the alerting service.
   * @param context -- A brief description of where the error occurred (E.G. Function name).
   * @param error -- The Node.js error object.
   */
  public async error(context: string, error: Error): Promise<void> {
    await fetch(`${this.url}/error`, {
      body: JSON.stringify({
        application: this.application,
        context:     context,
        message:     error.message,
        stack:       error.stack ?? "No stack trace available.",
      }),
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Standard header name.
        "Authorization": this.token,
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Standard header name.
        "Content-Type":  "application/json",
      },
      method: "POST",
    });
  }

  /**
   * Sends a counter metric to the alerting service.
   * The alerting service is configured to handle aggregation, so you can send
   * summative counts or individual increments. (e.g. Send a count of all users, or send a count of 1 every time a user joins).
   * @param name -- The name of the metric to track.
   * @param value -- The value of the metric to insert.
   * @param metadata -- Any metadata to attach to the metric.
   */
  public async metric(
    name: string,
    value: number,
    metadata: Record<string, string | number | boolean>,
  ): Promise<void> {
    await fetch(`${this.url}/metric`, {
      body: JSON.stringify({
        application: this.application,
        metadata:    metadata,
        name:        name,
        value:       value,
      }),
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Standard header name.
        "Authorization": this.token,
        // eslint-disable-next-line @typescript-eslint/naming-convention -- Standard header name.
        "Content-Type":  "application/json",
      },
      method: "POST",
    });
  }
}
