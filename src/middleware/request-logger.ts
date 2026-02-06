import { pinoHttp, stdSerializers } from 'pino-http';
import type { Request, Response } from 'express';
import { logger } from '../lib/logger.js';
import { config } from '../config/index.js';
import { httpRequestDuration, httpRequestTotal } from '../lib/metrics.js';

/**
 * HTTP request logging middleware using pino-http
 * Logs all HTTP requests with correlation IDs and timing
 */
export const requestLogger = pinoHttp<Request, Response>({
  logger,
  autoLogging: config.env !== 'test',
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) {
      return 'error';
    }
    if (res.statusCode >= 400) {
      return 'warn';
    }
    return 'info';
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return `${req.method} ${req.url} ${res.statusCode} - ${message}`;
  },
  customProps: (req) => ({
    requestId: req.requestId,
  }),
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'duration',
  },
  // Important: with customAttributeKeys + wrapSerializers:false, serializer keys
  // must match the remapped attribute keys.
  serializers: {
    request: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent'],
      },
      remoteAddress: req.socket.remoteAddress,
      requestId: req.requestId,
    }),
    response: (res) => ({
      statusCode: res.statusCode,
    }),
    error: stdSerializers.err,
  },
  customReceivedMessage: (req) => {
    return `Incoming request: ${req.method} ${req.url}`;
  },
  // Record metrics
  wrapSerializers: false,
  customReceivedObject: (req, res) => {
    const startTime = Date.now();
    res.on('finish', () => {
      try {
        const duration = (Date.now() - startTime) / 1000;
        const route = String(req.route?.path ?? req.path ?? 'unknown');
        const statusCode = String(res.statusCode);
        const labels = {
          method: req.method,
          route,
          status_code: statusCode,
        };

        httpRequestDuration.observe(labels, duration);
        httpRequestTotal.inc(labels);
      } catch (error) {
        req.log?.warn(
          {
            error: error instanceof Error ? error.message : String(error),
            route: req.path,
          },
          'Failed to record HTTP metrics'
        );
      }
    });
    return {};
  },
});
