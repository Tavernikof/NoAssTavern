import { exec } from "child_process";

const isWindows = process.platform === "win32";

const findProcessOnPort = (port: number) => new Promise<string | null>((resolve, reject) => {
  const cmd = isWindows
    ? `netstat -ano | findstr :${port}`
    : `lsof -i :${port} -sTCP:LISTEN -t || true`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) return resolve(null);
    const output = stdout.toString().trim();
    if (!output) return resolve(null);

    if (isWindows) {
      const lines = output.split("\n").filter(Boolean);
      if (lines.length > 0) {
        const parts = lines[0].trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        return resolve(pid);
      }
      resolve(null);
    } else {
      return resolve(output.split("\n")[0]);
    }

  });
});

const killProcess = (pid: string) => new Promise<null>((resolve, reject) => {
  const cmd = isWindows
    ? `taskkill /PID ${pid} /F`
    : `kill -9 ${pid}`;

  exec(cmd, (err) => {
    if (err) return reject(err);
    resolve(null);
  });
});

export const killExistProcess = async (port: number) => {
  const pid = await findProcessOnPort(port);
  if (pid) {
    console.log('Going to kill process: ' + pid);
    await killProcess(pid);
  }
};
