const isProduction = process.env.NODE_ENV === 'production';

function safeStringify(value) {
  try {
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function format(level, message, meta) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(meta && Object.keys(meta).length ? { meta } : {}),
  };
  return safeStringify(payload);
}

function log(level, message, meta) {
  const line = format(level, message, meta);
  if (level === 'error') {
    console.error(line);
    return;
  }
  console.log(line);
}

function debug(message, meta) {
  if (!isProduction) {
    log('debug', message, meta);
  }
}

function info(message, meta) {
  log('info', message, meta);
}

function warn(message, meta) {
  log('warn', message, meta);
}

function error(message, meta) {
  log('error', message, meta);
}

module.exports = {
  debug,
  info,
  warn,
  error,
};
