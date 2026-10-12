import { spawn } from 'child_process';

async function waitForServer(url, maxAttempts = 30, interval = 200) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // not yet ready
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  return false;
}

async function run() {
  const testPort = process.env.PORT || '5050';
  const baseUrl = process.env.BASE_URL || `http://localhost:${testPort}`;
  let serverProc = null;

  try {
    const isRunning = await waitForServer(`${baseUrl}/api/health`, 2, 100);
    if (!isRunning) {
      serverProc = spawn('node', ['server/src/index.js'], {
        stdio: 'inherit',
        env: { ...process.env, PORT: testPort }
      });

      const ready = await waitForServer(`${baseUrl}/api/health`, 30, 200);
      if (!ready) {
        throw new Error('Server failed to start in time for testing');
      }
    }

    const testProc = spawn('node', ['--test', 'tests/nepready.test.js', 'tests/nepready-regions.test.js'], {
      stdio: 'inherit',
      env: { ...process.env, BASE_URL: baseUrl }
    });

    const exitCode = await new Promise((resolve) => {
      testProc.on('close', resolve);
    });

    if (serverProc) {
      serverProc.kill('SIGTERM');
    }
    process.exit(exitCode || 0);
  } catch (err) {
    console.error('Test execution failed:', err);
    if (serverProc) {
      serverProc.kill('SIGTERM');
    }
    process.exit(1);
  }
}

run();
