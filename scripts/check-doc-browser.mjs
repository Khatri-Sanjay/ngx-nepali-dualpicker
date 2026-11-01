import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
// Reuse Karma's installed WebSocket transport; no production dependency is added.
const require = createRequire(import.meta.resolve('karma'));
const WebSocket = require('ws');
const root = path.resolve('dist/documentation/browser'),
	artifacts = path.resolve('tmp/docs-browser');
mkdirSync(artifacts, { recursive: true });
const executable = process.env.CHROME_BIN;
if (!executable) throw new Error('Set CHROME_BIN to a Chromium/Edge executable.');
const mime = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.ico': 'image/x-icon',
	'.svg': 'image/svg+xml',
	'.xml': 'application/xml',
	'.txt': 'text/plain',
};
const server = createServer((request, response) => {
	const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
	let file = path.resolve(root, '.' + pathname);
	if (!file.startsWith(root + path.sep) && file !== root) {
		response.writeHead(403).end();
		return;
	}
	if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
	if (!existsSync(file)) {
		response.writeHead(404).end('Not found');
		return;
	}
	response.setHeader('Content-Type', mime[path.extname(file)] ?? 'application/octet-stream');
	response.end(readFileSync(file));
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
const profile = path.join(artifacts, 'profile-' + Date.now());
mkdirSync(profile);
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
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let socket;
let id = 0;
const pending = new Map();
const errors = [];
const checks = [];
const axeReports = {};
function send(method, params = {}, sessionId) {
	return new Promise((resolve, reject) => {
		const requestId = ++id;
		pending.set(requestId, { resolve, reject });
		socket.send(JSON.stringify({ id: requestId, method, params, ...(sessionId ? { sessionId } : {}) }));
	});
}
try {
	for (let i = 0; i < 150 && !existsSync(path.join(profile, 'DevToolsActivePort')); i++) await sleep(100);
	const [port, endpoint] = readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').trim().split(/\r?\n/);
	socket = new WebSocket('ws://127.0.0.1:' + port + endpoint);
	await new Promise((resolve, reject) => {
		socket.once('open', resolve);
		socket.once('error', reject);
	});
	socket.on('message', (message) => {
		const event = JSON.parse(message);
		if (event.id) {
			const request = pending.get(event.id);
			pending.delete(event.id);
			if (event.error) request?.reject(new Error(event.error.message));
			else request?.resolve(event.result);
		}
		if (event.method === 'Runtime.exceptionThrown')
			errors.push(event.params.exceptionDetails.exception?.description ?? event.params.exceptionDetails.text);
		if (event.method === 'Runtime.consoleAPICalled' && event.params.type === 'error')
			errors.push(event.params.args.map((arg) => arg.value ?? arg.description).join(' '));
	});
	const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
	const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
	const call = (method, params) => send(method, params, sessionId);
	await call('Page.enable');
	await call('Runtime.enable');
	await call('Page.bringToFront');
	await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
	async function evaluate(expression) {
		const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
		if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
		return result.result.value;
	}
	async function wait(expression) {
		for (let i = 0; i < 120; i++) {
			if (await evaluate(expression)) return;
			await sleep(100);
		}
		throw new Error('Browser timed out: ' + expression);
	}
	async function visit(route) {
		await call('Page.navigate', { url: origin + route });
		await wait('document.querySelector("h1") && !!document.querySelector("app-root")?.getAttribute("ng-version")');
		await sleep(150);
	}
	function assert(condition, message) {
		if (!condition) throw new Error(message);
		checks.push(message);
	}
	async function screenshot(name) {
		const image = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
		writeFileSync(path.join(artifacts, name + '.png'), Buffer.from(image.data, 'base64'));
	}
	async function checkAccessibility(name) {
		await evaluate(readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8'));
		const violations = await evaluate(
			'(async()=>{const results=await axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}});return results.violations.map(item=>({id:item.id,impact:item.impact,description:item.description,nodes:item.nodes.map(node=>node.target)}));})()',
		);
		axeReports[name] = violations;
		writeFileSync(path.join(artifacts, 'accessibility.json'), JSON.stringify(axeReports, null, 2));
		assert(!violations.length, 'Automated WCAG checks: ' + name);
	}
	await call('Emulation.setDeviceMetricsOverride', {
		width: 1440,
		height: 1000,
		deviceScaleFactor: 1,
		mobile: false,
	});
	await visit('/introduction');
	assert(
		(await evaluate('document.querySelector("h1").textContent')).includes('Nepali dates.'),
		'Production introduction hydrates',
	);
	await screenshot('desktop-light');
	await checkAccessibility('desktop-light');
	await evaluate('document.querySelector(".theme-toggle").click()');
	await wait('!!document.querySelector(".site.dark")');
	assert(await evaluate('!!document.querySelector(".site.dark")'), 'Dark mode changes the rendered theme');
	await screenshot('desktop-dark');
	await checkAccessibility('desktop-dark');
	await evaluate('document.dispatchEvent(new KeyboardEvent("keydown",{key:"k",ctrlKey:true,bubbles:true}))');
	await wait('document.querySelector("dialog").open && document.querySelectorAll("[role=option]").length>0');
	await evaluate(
		'(()=>{const input=document.querySelector("#doc-search-input");input.value="rangeConstraints";input.dispatchEvent(new Event("input",{bubbles:true}));})()',
	);
	await wait('document.querySelector("mark")?.textContent.includes("rangeConstraints")');
	await screenshot('search');
	await checkAccessibility('search-dialog');
	await evaluate(
		'document.querySelector("#doc-search-input").dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true}))',
	);
	await wait('location.pathname==="/configuration"');
	assert(true, 'Keyboard search opens configuration reference');
	await visit('/changelog');
	assert((await evaluate('document.body.textContent')).includes('Latest published'), 'Real release history renders');
	await visit('/pickers');
	await evaluate('document.querySelector(".example-placeholder").scrollIntoView()');
	await wait('!!document.querySelector("app-demo-card")');
	await evaluate(
		'document.querySelector("app-demo-card .datepicker-input").scrollIntoView({block:"center",behavior:"instant"})',
	);
	await evaluate('document.querySelector("app-demo-card .form-icon").click()');
	await wait(
		'(()=>{const popup=document.querySelector("app-demo-card .datepicker__container");return popup && getComputedStyle(popup).visibility==="visible";})()',
	);
	assert(
		await evaluate(
			'(()=>{const body=document.querySelector("app-demo-card .datepicker__body");return body.scrollHeight<=body.clientHeight+1;})()',
		),
		'Desktop calendar shows the complete month without scrolling',
	);
	await screenshot('desktop-calendar');
	await evaluate('document.querySelector("app-demo-card .form-icon").click()');
	await evaluate('document.querySelector(".configuration-editor").open=true');
	await evaluate(
		'(()=>{const editor=document.querySelector(".configuration-editor textarea");editor.value=JSON.stringify({calendar:"AD",selectionMode:"range",inline:true});editor.dispatchEvent(new Event("input",{bubbles:true}));document.querySelector(".configuration-editor button").click();})()',
	);
	await wait('!!document.querySelector("app-demo-card [role=grid]")');
	assert(true, 'Validated configuration updates the actual calendar');
	await screenshot('live-configuration');
	await call('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
	await visit('/introduction');
	assert(
		await evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'),
		'Mobile introduction fits viewport',
	);
	await screenshot('mobile');
	assert(
		await evaluate('getComputedStyle(document.querySelector(".trigger-label")).display==="none"'),
		'Mobile search hides its long label',
	);
	await evaluate('document.querySelector(".menu-toggle").click()');
	await wait('document.querySelector(".sidebar.mobile-open")');
	assert(
		await evaluate('document.body.style.overflow==="hidden" && document.querySelector("main").inert'),
		'Mobile navigation locks background and exposes dialog',
	);
	await screenshot('mobile-navigation');
	await checkAccessibility('mobile-navigation');
	await evaluate('document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}))');
	await wait('!document.querySelector(".sidebar.mobile-open")');
	assert(true, 'Escape dismisses navigation');
	await visit('/configuration');
	assert(
		await evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'),
		'Mobile API tables stay inside viewport',
	);
	await screenshot('mobile-api');
	await checkAccessibility('mobile-api');
	assert(!errors.length, 'Production interactions emit no console errors');
	writeFileSync(path.join(artifacts, 'results.json'), JSON.stringify({ checks, errors, origin }, null, 2));
	process.stdout.write(
		'PASS: ' + checks.length + ' production-browser checks. Screenshots and axe results: tmp/docs-browser.\n',
	);
} catch (error) {
	writeFileSync(
		path.join(artifacts, 'failure.json'),
		JSON.stringify({ message: error.message, checks, errors }, null, 2),
	);
	throw error;
} finally {
	if (socket?.readyState === WebSocket.OPEN) {
		await send('Browser.close').catch(() => {});
		socket.close();
	}
	child.kill();
	server.close();
}
