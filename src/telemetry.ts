import { stringifyProperties } from './util';
import TelemetryReporter, { type TelemetryEventMeasurements } from '@vscode/extension-telemetry';

export function sendTelemetryEvent(name: string, properties: Record<string, unknown> = {}, measurements: TelemetryEventMeasurements = {}) {
  reporter.sendTelemetryEvent(name, stringifyProperties(properties), measurements);
}

export const reporter = new TelemetryReporter('ddd120bc-1e9b-474e-82e6-d49dff4227ff');
