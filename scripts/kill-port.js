const { execSync } = require('child_process');

try {
  // For Windows
  if (process.platform === 'win32') {
    console.log('Finding processes using port 3000 and 3001...');
    
    try {
      // Find process using port 3000
      const output3000 = execSync('netstat -ano | findstr :3000').toString();
      if (output3000) {
        const lines = output3000.split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length > 4) {
            const pid = parts[4];
            if (pid && parseInt(pid)) {
              console.log(`Killing process ${pid} using port 3000`);
              execSync(`taskkill /F /PID ${pid}`);
            }
          }
        }
      }
    } catch (err) {
      console.log('No process found using port 3000.');
    }
    
    try {
      // Find process using port 3001
      const output3001 = execSync('netstat -ano | findstr :3001').toString();
      if (output3001) {
        const lines = output3001.split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length > 4) {
            const pid = parts[4];
            if (pid && parseInt(pid)) {
              console.log(`Killing process ${pid} using port 3001`);
              execSync(`taskkill /F /PID ${pid}`);
            }
          }
        }
      }
    } catch (err) {
      console.log('No process found using port 3001.');
    }
  } else {
    // For Unix-based systems
    try {
      execSync('npx kill-port 3000 3001');
      console.log('Killed processes on ports 3000 and 3001');
    } catch (err) {
      console.log('No processes found on ports 3000 and 3001');
    }
  }
  
  console.log('Ports cleared successfully.');
} catch (err) {
  console.error('Error clearing ports:', err);
} 