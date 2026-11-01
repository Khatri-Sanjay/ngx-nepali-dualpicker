import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const cli = fileURLToPath(new URL('../node_modules/@angular/cli/bin/ng.js', import.meta.url));
const children = new Set();
let stopping = false;

function stop(code) {
	if (stopping) return;
	stopping = true;
	process.exitCode = code;
	for (const child of children) child.kill('SIGTERM');
}

process.on('SIGINT', () => stop(130));
process.on('SIGTERM', () => stop(143));

for (const [app, port] of [
	['playground', '4200'],
	['documentation', '4201'],
]) {
	const child = spawn(process.execPath, [cli, 'serve', app, '--port', port], {
		cwd: root,
		stdio: 'inherit',
	});
	children.add(child);
	child.on('error', (error) => {
		console.error(`Unable to start ${app}: ${error.message}`);
		stop(1);
	});
	child.on('exit', (code) => {
		children.delete(child);
		if (!stopping) stop(code ?? 1);
	});
}
