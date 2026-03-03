let mockDownloads = [
    {
        id: Date.now() - 10000,
        name: "Interstellar.2014.2160p.BluRay.x265.mp4",
        size: "14.2 GB",
        totalSizeRaw: 14.2 * 1024 * 1024 * 1024,
        downloadedRaw: 13.0 * 1024 * 1024 * 1024,
        status: "92%",
        state: "downloading", // downloading, paused, error, complete
        timeLeft: "12 min 30 sec",
        rate: "15.4 MB/s",
        date: "Today 10:45 AM",
        category: "Video",
        isFinished: false
    },
    {
        id: Date.now() - 20000,
        name: "NodeJS_Masterclass_Course.zip",
        size: "4.5 GB",
        totalSizeRaw: 4.5 * 1024 * 1024 * 1024,
        downloadedRaw: 4.5 * 1024 * 1024 * 1024,
        status: "Complete",
        state: "complete",
        timeLeft: "--",
        rate: "--",
        date: "Yesterday 04:20 PM",
        category: "Compressed",
        isFinished: true
    }
];

let currentFilter = 'all';
let selectedItemId = null;

function renderDownloads() {
    const tableBody = document.getElementById('table-body');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const filteredDownloads = mockDownloads.filter(download => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'finished') return download.isFinished;
        if (currentFilter === 'unfinished') return !download.isFinished;
        if (currentFilter.startsWith('finished-')) {
            const cat = currentFilter.split('-')[1];
            return download.isFinished && download.category === cat;
        }
        if (currentFilter.startsWith('unfinished-')) {
            const cat = currentFilter.split('-')[1];
            return !download.isFinished && download.category === cat;
        }
        return download.category === currentFilter;
    });

    filteredDownloads.forEach(download => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', download.id);
        if (selectedItemId === download.id) row.classList.add('selected-row');

        row.onclick = () => {
            selectedItemId = download.id;
            renderDownloads();
        };

        let statusText = download.status;
        let statusClass = '';
        if (download.state === 'complete') statusClass = 'status-complete';
        else if (download.state === 'paused') {
            statusClass = 'status-paused';
            statusText = "Paused (" + download.status + ")";
        }
        else if (download.state === 'error') statusClass = 'status-danger';

        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i data-lucide="${getFileIcon(download.name)}" style="width: 16px; height: 16px; color: #94a3b8;"></i>
                    ${download.name}
                </div>
            </td>
            <td>${download.size}</td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
                ${download.state === 'downloading' || download.state === 'paused' ? `
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${download.status}"></div>
                    </div>
                ` : ''}
            </td>
            <td>${download.timeLeft}</td>
            <td>${download.rate}</td>
            <td>${download.date}</td>
        `;
        tableBody.appendChild(row);
    });

    if (window.lucide) window.lucide.createIcons();
    const statsSpan = document.querySelector('.stats span:first-child');
    if (statsSpan) statsSpan.innerText = `Items: ${filteredDownloads.length}`;
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
        case 'mp4': case 'mkv': case 'mov': case 'avi': return 'file-video';
        case 'zip': case 'rar': case '7z': return 'file-archive';
        case 'exe': case 'msi': return 'box';
        case 'pdf': case 'doc': case 'docx': return 'file-text';
        case 'mp3': case 'wav': case 'flac': return 'music';
        default: return 'file';
    }
}

function detectCategory(url) {
    const ext = url.split('.').pop().split('?')[0].toLowerCase();
    const videoExts = ['mp4', 'mkv', 'mov', 'avi', 'webm'];
    const musicExts = ['mp3', 'wav', 'flac', 'm4a'];
    const archiveExts = ['zip', 'rar', '7z', 'iso'];
    const docExts = ['pdf', 'doc', 'docx', 'txt', 'xls'];
    const progExts = ['exe', 'msi', 'dmg', 'bat'];

    if (videoExts.includes(ext)) return "Video";
    if (musicExts.includes(ext)) return "Music";
    if (archiveExts.includes(ext)) return "Compressed";
    if (docExts.includes(ext)) return "Documents";
    if (progExts.includes(ext)) return "Programs";
    return "Programs"; // Default
}

// Download Engine Simulation
setInterval(() => {
    let changed = false;
    mockDownloads.forEach(download => {
        if (download.state === 'downloading') {
            changed = true;
            // Simulate speed fluctuation
            const speed = Math.random() * (20 - 5) + 5; // 5-20 MB/s
            download.rate = speed.toFixed(1) + " MB/s";

            // Increment progress
            const chunk = speed * 1024 * 1024 * 1; // bytes per interval (roughly)
            download.downloadedRaw += chunk;

            if (download.downloadedRaw >= download.totalSizeRaw) {
                download.downloadedRaw = download.totalSizeRaw;
                download.status = "Complete";
                download.state = "complete";
                download.isFinished = true;
                download.rate = "--";
                download.timeLeft = "--";
            } else {
                const percent = (download.downloadedRaw / download.totalSizeRaw) * 100;
                download.status = percent.toFixed(0) + "%";

                // Estimate time left
                const remaining = download.totalSizeRaw - download.downloadedRaw;
                const seconds = remaining / (speed * 1024 * 1024);
                if (seconds > 3600) {
                    download.timeLeft = Math.floor(seconds / 3600) + " hr " + Math.floor((seconds % 3600) / 60) + " min";
                } else if (seconds > 60) {
                    download.timeLeft = Math.floor(seconds / 60) + " min " + Math.floor(seconds % 60) + " sec";
                } else {
                    download.timeLeft = Math.floor(seconds) + " sec";
                }
            }
        }
    });
    if (changed) renderDownloads();
}, 1000);

// Toolbar Actions
function setupToolbar() {
    document.getElementById('resume-btn').onclick = () => {
        const item = mockDownloads.find(d => d.id === selectedItemId);
        if (item && item.state === 'paused') {
            item.state = 'downloading';
            renderDownloads();
        }
    };

    document.getElementById('stop-btn').onclick = () => {
        const item = mockDownloads.find(d => d.id === selectedItemId);
        if (item && item.state === 'downloading') {
            item.state = 'paused';
            item.rate = "0 KB/s";
            renderDownloads();
        }
    };

    document.getElementById('stop-all-btn').onclick = () => {
        mockDownloads.forEach(d => {
            if (d.state === 'downloading') {
                d.state = 'paused';
                d.rate = "0 KB/s";
            }
        });
        renderDownloads();
    };

    document.getElementById('delete-btn').onclick = () => {
        if (selectedItemId) {
            mockDownloads = mockDownloads.filter(d => d.id !== selectedItemId);
            selectedItemId = null;
            renderDownloads();
            showToast("Item deleted", "info");
        }
    };
}

// Sidebar Interaction Logic
function setupSidebar() {
    const treeItems = document.querySelectorAll('.tree-item');
    const toggleIcons = document.querySelectorAll('.toggle-icon');

    treeItems.forEach(item => {
        item.addEventListener('click', (e) => {
            document.querySelectorAll('.tree-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const node = item.closest('.tree-node');
            if (node) node.classList.toggle('expanded');
            currentFilter = item.getAttribute('data-filter');
            renderDownloads();
        });
    });

    toggleIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const node = icon.closest('.tree-node');
            if (node) node.classList.toggle('expanded');
        });
    });
}

function setupModal() {
    const addUrlBtn = document.getElementById('add-url');
    const modal = document.getElementById('download-modal');
    const urlInput = document.getElementById('url-input');

    addUrlBtn.onclick = () => {
        modal.style.display = 'flex';
        urlInput.value = '';
        urlInput.focus();
    };

    document.getElementById('modal-cancel').onclick = () => modal.style.display = 'none';
    document.querySelector('.close-btn').onclick = () => modal.style.display = 'none';

    document.getElementById('modal-ok').onclick = () => {
        const url = urlInput.value.trim();
        if (!url) {
            showToast("Error: Please add a valid URL address");
            return;
        }

        const fileName = url.split('/').pop().split('?')[0] || "download_" + Date.now();
        const category = detectCategory(url);
        const randomSizeGB = (Math.random() * 5 + 0.1).toFixed(1); // 0.1 - 5 GB

        const newDownload = {
            id: Date.now(),
            name: fileName,
            size: randomSizeGB + " GB",
            totalSizeRaw: parseFloat(randomSizeGB) * 1024 * 1024 * 1024,
            downloadedRaw: 0,
            status: "0%",
            state: "downloading",
            timeLeft: "Calculating...",
            rate: "0 KB/s",
            date: "Today " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            category: category,
            isFinished: false
        };

        mockDownloads.unshift(newDownload);
        renderDownloads();
        modal.style.display = 'none';
        showToast(`Detecting: ${category} - Download Started`, "success");
    };
}

function showToast(message, type = "error") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    if (type === "success") toast.style.background = "#10b981";
    if (type === "info") toast.style.background = "#3b82f6";
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    renderDownloads();
    setupSidebar();
    setupModal();
    setupToolbar();
});

const styleEl = document.createElement('style');
styleEl.textContent = `
    .selected-row td { background: rgba(59, 130, 246, 0.15) !important; }
    .status-badge { font-weight: 500; }
    .status-complete { color: #10b981; }
    .status-paused { color: #f59e0b; }
    .status-danger { color: #ef4444; }
`;
document.head.appendChild(styleEl);
