/**
 * Advanced PDF Editor - Core Logic (Refined & Fixed)
 */

const { PDFDocument, rgb, degrees, StandardFonts } = PDFLib;
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// --- STATE ---
let pdfBytes = null;
let pageCount = 0;
let currentPageIdx = 0;
let zoom = 1.0;
let activeTool = 'select';
let activeColor = '#e63946';
let activeSize = 4;
let filename = 'document';

let pageObjects = {}; 
let history = [];
let redoStack = [];

let isDrawing = false;
let currentPath = null;
let currentObject = null;
let dragTarget = null;
let startX, startY;
let activeDrawingPageIdx = null; // Tracks which page is currently being edited

// DOM Elements
const pdfInput = document.getElementById('pdf-input');
const imageInput = document.getElementById('image-input');
const landingPage = document.getElementById('landing-page');
const editorView = document.getElementById('editor-view');
const workspace = document.getElementById('workspace');
const thumbPanel = document.getElementById('thumbnail-panel');
const loadingOverlay = document.getElementById('loading-overlay');
const filenameInput = document.getElementById('pdf-filename');

// --- INITIALIZATION ---

document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTool = btn.dataset.tool;
        document.getElementById('active-tool-display').innerText = `Tool: ${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}`;
    };
});

document.getElementById('sidebar-toggle').onclick = () => thumbPanel.classList.toggle('collapsed');
document.getElementById('zoom-in').onclick = () => { zoom += 0.2; refreshAll(); };
document.getElementById('zoom-out').onclick = () => { zoom = Math.max(0.5, zoom - 0.2); refreshAll(); };
document.getElementById('new-file-btn').onclick = () => {
    landingPage.classList.remove('hidden');
    editorView.classList.add('hidden');
    document.body.classList.remove('editor-active');
};

document.getElementById('image-btn').onclick = () => imageInput.click();
imageInput.onchange = (e) => handleImage(e.target.files[0]);

pdfInput.onchange = (e) => handlePDF(e.target.files[0]);
filenameInput.oninput = (e) => filename = e.target.value || 'document';

// Landing Page Drop Zone
setupDragDrop('drop-zone-landing', (files) => {
    if (files.length) handlePDF(files[0]);
});

// Click to upload fallback
const landingDropZone = document.getElementById('drop-zone-landing');
if (landingDropZone) {
    landingDropZone.onclick = () => pdfInput.click();
}

// --- PDF HANDLING ---

async function handlePDF(file) {
    if (!file || file.type !== 'application/pdf') return;

    loadingOverlay.classList.remove('hidden');
    pdfBytes = await file.arrayBuffer();
    filename = file.name.replace('.pdf', '');
    filenameInput.value = filename;

    const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
    pageCount = pdf.numPages;
    pageObjects = {};
    history = [];

    workspace.innerHTML = '';
    thumbPanel.innerHTML = '';

    // Auto-zoom for mobile
    if (window.innerWidth < 768) {
        const firstPage = await pdf.getPage(1);
        const baseViewport = firstPage.getViewport({ scale: 1.0 });
        const availableWidth = workspace.clientWidth - 32; // 1rem padding total
        zoom = (availableWidth / (baseViewport.width * 1.5));
        zoom = Math.min(1.0, Math.floor(zoom * 10) / 10);
    }
    document.getElementById('zoom-level').innerText = Math.round(zoom * 100) + '%';

    for (let i = 1; i <= pageCount; i++) {
        pageObjects[i - 1] = [];
        await renderPage(pdf, i);
        await renderThumbnail(pdf, i);
    }

    landingPage.classList.add('hidden');
    editorView.classList.remove('hidden');
    document.body.classList.add('editor-active');
    loadingOverlay.classList.add('hidden');
    setupScrollSync();
}

async function renderPage(pdf, pageNum) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 * zoom });

    const container = document.createElement('div');
    container.className = 'page-container';
    container.id = `page-container-${pageNum - 1}`;
    container.dataset.index = pageNum - 1;
    container.style.width = viewport.width + 'px';
    container.style.height = viewport.height + 'px';

    const canvas = document.createElement('canvas');
    canvas.className = 'rendering-canvas';
    canvas.width = viewport.width; canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

    const editLayer = document.createElement('canvas');
    editLayer.className = 'editing-layer';
    editLayer.width = viewport.width; editLayer.height = viewport.height;
    setupEvents(editLayer, pageNum - 1);

    container.appendChild(canvas);
    container.appendChild(editLayer);
    workspace.appendChild(container);

    redraw(pageNum - 1);
}

async function renderThumbnail(pdf, pageNum) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 0.2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width; canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

    const item = document.createElement('div');
    item.className = 'thumb-item';
    item.onclick = () => document.getElementById(`page-container-${pageNum - 1}`).scrollIntoView({ behavior: 'smooth' });
    item.appendChild(canvas);
    thumbPanel.appendChild(item);
}

// --- INTERACTION ---

function setupEvents(canvas, pageIdx) {
    const ctx = canvas.getContext('2d');
    const getPos = (e) => {
        const r = canvas.getBoundingClientRect();
        return { 
            x: (e.clientX - r.left) * (canvas.width / r.width), 
            y: (e.clientY - r.top) * (canvas.height / r.height) 
        };
    };

    canvas.onmousedown = (e) => {
        activeDrawingPageIdx = pageIdx; // Lock this interaction to THIS page
        const pos = getPos(e);
        startX = pos.x; startY = pos.y;

        if (activeTool === 'select') {
            const list = pageObjects[pageIdx];
            for (let i = list.length - 1; i >= 0; i--) {
                const obj = list[i];
                if (isPosInside(obj, pos)) {
                    dragTarget = obj;
                    startX = pos.x - dragTarget.x; startY = pos.y - dragTarget.y;
                    return;
                }
            }
        } else if (activeTool === 'text') {
            const txt = prompt("Enter text:");
            if (txt) {
                pageObjects[pageIdx].push({ type: 'text', text: txt, x: pos.x, y: pos.y, color: activeColor, size: activeSize * 6 });
                saveState(); redraw(pageIdx);
            }
        } else if (activeTool === 'draw' || activeTool === 'highlight' || activeTool === 'eraser') {
            isDrawing = true;
            currentPath = [{ x: pos.x, y: pos.y }];
            currentObject = { 
                type: 'draw', 
                path: currentPath, 
                color: activeTool === 'eraser' ? '#ffffff' : (activeTool === 'highlight' ? activeColor + '77' : activeColor), 
                size: activeTool === 'eraser' ? activeSize * 4 : activeSize 
            };
        } else if (activeTool === 'rect' || activeTool === 'circle') {
            isDrawing = true;
            currentObject = { type: activeTool, x: pos.x, y: pos.y, w: 0, h: 0, color: activeColor, size: activeSize };
        }
    };

    canvas.onmousemove = (e) => {
        if (activeDrawingPageIdx !== pageIdx) return; // Ignore moves on non-active page
        const pos = getPos(e);
        if (dragTarget) {
            dragTarget.x = pos.x - startX; dragTarget.y = pos.y - startY;
            redraw(pageIdx);
        } else if (isDrawing) {
            if (activeTool === 'rect' || activeTool === 'circle') {
                currentObject.w = pos.x - startX;
                currentObject.h = pos.y - startY;
            } else {
                currentPath.push({ x: pos.x, y: pos.y });
            }
            redraw(pageIdx);
            // Dynamic preview
            if (activeTool === 'rect') drawRect(ctx, currentObject);
            else if (activeTool === 'circle') drawCircle(ctx, currentObject);
            else drawPath(ctx, currentPath, currentObject.color, currentObject.size);
        }
    };
}

// Single global mouseup — always saves to the page that STARTED the interaction
window.onmouseup = () => {
    if (activeDrawingPageIdx === null) return;
    if (isDrawing && currentObject) {
        pageObjects[activeDrawingPageIdx].push(JSON.parse(JSON.stringify(currentObject)));
        saveState();
        redraw(activeDrawingPageIdx);
    }
    isDrawing = false;
    dragTarget = null;
    currentObject = null;
};

function isPosInside(obj, pos) {
    const t = 20;
    if (obj.type === 'text') return Math.abs(obj.x - pos.x) < t*2 && Math.abs(obj.y - pos.y) < t;
    if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'image') {
        const xMin = Math.min(obj.x, obj.x + obj.w);
        const xMax = Math.max(obj.x, obj.x + obj.w);
        const yMin = Math.min(obj.y, obj.y + obj.h);
        const yMax = Math.max(obj.y, obj.y + obj.h);
        return pos.x >= xMin && pos.x <= xMax && pos.y >= yMin && pos.y <= yMax;
    }
    return false;
}

// --- RENDERING CORE ---

function redraw(pageIdx) {
    const canvas = document.querySelector(`#page-container-${pageIdx} .editing-layer`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pageObjects[pageIdx].forEach(obj => {
        if (obj.type === 'text') {
            ctx.font = `${obj.size}px sans-serif`; ctx.fillStyle = obj.color;
            ctx.fillText(obj.text, obj.x, obj.y);
        } else if (obj.type === 'draw') {
            drawPath(ctx, obj.path, obj.color, obj.size);
        } else if (obj.type === 'rect') {
            drawRect(ctx, obj);
        } else if (obj.type === 'circle') {
            drawCircle(ctx, obj);
        } else if (obj.type === 'image') {
            if (obj._cached) ctx.drawImage(obj._cached, obj.x, obj.y, obj.w, obj.h);
            else {
                const img = new Image();
                img.onload = () => { obj._cached = img; redraw(pageIdx); };
                img.src = obj.dataUrl;
            }
        }
    });
}

function drawPath(ctx, path, col, size) {
    if (!path || path.length < 2) return;
    ctx.beginPath(); ctx.strokeStyle = col; ctx.lineWidth = size; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.stroke();
}

function drawRect(ctx, obj) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
}

function drawCircle(ctx, obj) {
    ctx.beginPath();
    ctx.fillStyle = obj.color;
    ctx.ellipse(obj.x + obj.w/2, obj.y + obj.h/2, Math.abs(obj.w/2), Math.abs(obj.h/2), 0, 0, Math.PI * 2);
    ctx.fill();
}

// --- UTILS ---

async function refreshAll() {
    const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
    workspace.innerHTML = '';
    for (let i = 1; i <= pageCount; i++) await renderPage(pdf, i);
    document.getElementById('zoom-level').innerText = Math.round(zoom * 100) + '%';
}

function saveState() {
    history.push(JSON.parse(JSON.stringify(pageObjects)));
    if (history.length > 50) history.shift();
    redoStack = [];
}

document.getElementById('undo-btn').onclick = () => {
    if (history.length < 2) return;
    redoStack.push(history.pop());
    pageObjects = JSON.parse(JSON.stringify(history[history.length - 1]));
    for (let i = 0; i < pageCount; i++) redraw(i);
};

document.getElementById('redo-btn').onclick = () => {
    if (!redoStack.length) return;
    const s = redoStack.pop();
    history.push(s);
    pageObjects = JSON.parse(JSON.stringify(s));
    for (let i = 0; i < pageCount; i++) redraw(i);
};

document.getElementById('clear-all-btn').onclick = () => {
    if (confirm("Clear all items on this page?")) {
        pageObjects[currentPageIdx] = [];
        saveState(); redraw(currentPageIdx);
    }
};

function handleImage(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        pageObjects[currentPageIdx].push({
            type: 'image',
            dataUrl: e.target.result,
            x: 100, y: 100, w: 200, h: 200
        });
        saveState(); redraw(currentPageIdx);
    };
    reader.readAsDataURL(file);
}

function setupScrollSync() {
    workspace.onscroll = () => {
        document.querySelectorAll('.page-container').forEach(c => {
            const r = c.getBoundingClientRect();
            if (r.top < 300 && r.bottom > 300) currentPageIdx = parseInt(c.dataset.index);
        });
    };
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3), 16) / 255;
    const g = parseInt(hex.slice(3,5), 16) / 255;
    const b = parseInt(hex.slice(5,7), 16) / 255;
    return { r, g, b };
}

// --- EXPORT ---

document.getElementById('save-btn').onclick = async () => {
    loadingOverlay.classList.remove('hidden');
    try {
        const doc = await PDFDocument.load(pdfBytes);
        const pages = doc.getPages();

        for (let i = 0; i < pageCount; i++) {
            const page = pages[i];
            const { width, height } = page.getSize();
            const canvas = document.querySelector(`#page-container-${i} .rendering-canvas`);
            if (!canvas) continue;
            const sX = width / canvas.width; const sY = height / canvas.height;

            for (const obj of pageObjects[i]) {
                const c = hexToRgb(obj.color ? obj.color.substring(0,7) : '#000000');
                const col = rgb(c.r, c.g, c.b);
                const op = obj.color && obj.color.length > 7 ? 0.4 : 1.0;

                if (obj.type === 'text') {
                    page.drawText(obj.text, { x: obj.x * sX, y: height - (obj.y * sY), size: obj.size * sY, color: col });
                } else if (obj.type === 'draw') {
                    for (let j = 1; j < obj.path.length; j++) {
                        page.drawLine({
                            start: { x: obj.path[j-1].x * sX, y: height - (obj.path[j-1].y * sY) },
                            end: { x: obj.path[j].x * sX, y: height - (obj.path[j].y * sY) },
                            thickness: obj.size * sY, color: col, opacity: op
                        });
                    }
                } else if (obj.type === 'rect') {
                    page.drawRectangle({
                        x: obj.x * sX, y: height - ((obj.y + obj.h) * sY),
                        width: obj.w * sX, height: obj.h * sY,
                        color: col, opacity: op
                    });
                } else if (obj.type === 'circle') {
                    page.drawEllipse({
                        x: (obj.x + obj.w/2) * sX, y: height - ((obj.y + obj.h/2) * sY),
                        xRadius: Math.abs(obj.w/2) * sX, yRadius: Math.abs(obj.h/2) * sY,
                        color: col, opacity: op
                    });
                } else if (obj.type === 'image') {
                    const bytes = await fetch(obj.dataUrl).then(r => r.arrayBuffer());
                    const img = obj.dataUrl.includes('png') ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
                    page.drawImage(img, {
                        x: obj.x * sX, y: height - ((obj.y + obj.h) * sY),
                        width: obj.w * sX, height: obj.h * sY
                    });
                }
            }
        }

        const out = await doc.save();
        const a = document.createElement('a'); 
        a.href = URL.createObjectURL(new Blob([out], { type: 'application/pdf' }));
        a.download = `${filename}.pdf`;
        a.click();
    } catch (e) { alert("Error: " + e.message); }
    loadingOverlay.classList.add('hidden');
};

document.getElementById('stroke-color').oninput = (e) => activeColor = e.target.value;
document.getElementById('stroke-width').oninput = (e) => activeSize = parseInt(e.target.value);
