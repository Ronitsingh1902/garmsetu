const { spawn } = require('child_process');
const fs = require('fs');

const MAX_RESTARTS = 5;
let restartCount = 0;

function startServer() {
    console.log('[Watchdog] Starting GramSetu Backend...');

    // Spawn the backend process
    const backend = spawn('node', ['index.js'], { stdio: 'inherit' });

    backend.on('close', (code) => {
        if (code !== 0) {
            console.error(`[Watchdog] Backend crashed with code ${code}.`);
            logCrash(code, null);

            if (restartCount < MAX_RESTARTS) {
                console.log(`[Watchdog] Restarting in 3 seconds... (${restartCount + 1}/${MAX_RESTARTS})`);
                restartCount++;
                setTimeout(startServer, 3000);
            } else {
                console.error('[Watchdog] Max restarts exceeded. Manual intervention required.');
                process.exit(1);
            }
        } else {
            console.log('[Watchdog] Backend stopped normally.');
            process.exit(0);
        }
    });

    backend.on('error', (err) => {
        console.error('[Watchdog] Failed to start backend:', err);
    });
}

function logCrash(code, signal) {
    const logMsg = `[${new Date().toISOString()}] Crash detected. Exit Code: ${code}, Signal: ${signal}\n`;
    fs.appendFileSync('crash.log', logMsg);
}

// Start the monitoring
startServer();
