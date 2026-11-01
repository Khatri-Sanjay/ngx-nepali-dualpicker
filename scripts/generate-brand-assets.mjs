import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.resolve('karma'));
const WebSocket = require('ws');
const executable = process.env.CHROME_BIN || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
if (!existsSync(executable)) throw new Error('Set CHROME_BIN to an installed Chromium browser.');
const profile = path.resolve('tmp/brand-render-' + Date.now());
mkdirSync(profile, { recursive: true });
const child = spawn(
	executable,
	[
		'--headless=new',
		'--disable-gpu',
		'--no-first-run',
		'--no-default-browser-check',
		'--remote-debugging-port=0',
		'--user-data-dir=' + profile,
		'about:blank',
	],
	{ windowsHide: true, stdio: 'ignore' },
);
let socket;
let id = 0;
const requests = new Map();
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function send(method, params = {}) {
	return new Promise((resolve, reject) => {
		const requestId = ++id;
		requests.set(requestId, { resolve, reject });
		socket.send(JSON.stringify({ id: requestId, method, params }));
	});
}
try {
	for (let i = 0; i < 150 && !existsSync(path.join(profile, 'DevToolsActivePort')); i++) await pause(100);
	const [port] = readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split(/\r?\n/);
	const targets = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
	socket = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
	await new Promise((resolve, reject) => {
		socket.once('open', resolve);
		socket.once('error', reject);
	});
	socket.on('message', (data) => {
		const event = JSON.parse(data);
		if (!event.id) return;
		const request = requests.get(event.id);
		requests.delete(event.id);
		if (event.error) request?.reject(new Error(event.error.message));
		else request?.resolve(event.result);
	});
	async function raster(source, width, height) {
		const svg = readFileSync(source, 'utf8');
		const result = await send('Runtime.evaluate', {
			awaitPromise: true,
			returnByValue: true,
			expression: `(async () => {
            const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(${JSON.stringify(svg)});
            await img.decode(); const canvas = document.createElement('canvas'); canvas.width = ${width}; canvas.height = ${height};
            canvas.getContext('2d').drawImage(img, 0, 0, ${width}, ${height}); return canvas.toDataURL('image/png').split(',')[1];
        })()`,
		});
		if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
		return Buffer.from(result.result.value, 'base64');
	}
	const root = 'apps/shared/assets/brand';
	const sizes = [16, 32, 48, 180, 192, 512];
	const images = new Map();
	for (const size of sizes) {
		const png = await raster(root + '/logo.svg', size, size);
		images.set(size, png);
		writeFileSync(root + '/icon-' + size + '.png', png);
	}
	writeFileSync(root + '/social-card.png', await raster(root + '/social-card.svg', 1200, 630));
	const entries = [16, 32, 48];
	const header = Buffer.alloc(6 + entries.length * 16);
	header.writeUInt16LE(1, 2);
	header.writeUInt16LE(entries.length, 4);
	let offset = header.length;
	entries.forEach((size, index) => {
		const position = 6 + index * 16;
		const png = images.get(size);
		header[position] = size;
		header[position + 1] = size;
		header.writeUInt16LE(1, position + 4);
		header.writeUInt16LE(32, position + 6);
		header.writeUInt32LE(png.length, position + 8);
		header.writeUInt32LE(offset, position + 12);
		offset += png.length;
	});
	const ico = Buffer.concat([header, ...entries.map((size) => images.get(size))]);
	for (const app of ['documentation', 'playground']) writeFileSync('apps/' + app + '/src/favicon.ico', ico);
	console.log('Generated 16/32/48px ICOs, 180/192/512px icons and 1200x630 social card from the SVG sources.');
} finally {
	socket?.close();
	child.kill();
}
