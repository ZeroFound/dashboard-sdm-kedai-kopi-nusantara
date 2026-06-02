// ============================================================
// APP.JS - SIM SDM Advanced Dashboard
// Fitur: CRUD Karyawan, CRUD Absensi, localStorage, Smart Alerts,
//        Detail Modal, Export PDF via print, Real-time Notifications
// ============================================================

// ============================================================
// DATA STORE (with localStorage persistence)
// ============================================================
const STORAGE_KEY = 'sim_sdm_kopi_data';
const THEME_KEY = 'sim_sdm_kopi_theme';
const YEAR_KEY = 'sim_sdm_kopi_year';
const DEFAULT_YEAR = '2026';
const STATUS_LIST = ['Hadir', 'Izin', 'Sakit', 'Alpha'];
const JABATAN_LIST = ['Kasir', 'Barista', 'Koki', 'Admin', 'Pelayan'];
const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch(e) {}
    return null;
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            karyawan: DATA_KARYAWAN,
            absensi: DATA_ABSENSI
        }));
    } catch(e) {}
}

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

function normalizeText(value) {
    return String(value ?? '').toLowerCase().trim();
}

function debounce(fn, wait = 160) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), wait);
    };
}

function createAbsensiRid() {
    return 'A' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7).toUpperCase();
}

function normalizeAbsensi(records) {
    return (records || []).map((record, index) => ({
        rid: record.rid || `A${String(index + 1).padStart(4, '0')}`,
        tgl: record.tgl || '',
        id: record.id || '',
        nama: record.nama || '',
        jabatan: record.jabatan || '',
        status: STATUS_LIST.includes(record.status) ? record.status : 'Hadir',
        ket: record.ket || '-'
    }));
}

function normalizeKaryawan(records) {
    return (records || []).map(record => ({
        ...record,
        gaji: Number(record.gaji) || 0
    }));
}

function parseDateID(value) {
    if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    const raw = String(value || '').trim();
    if (!raw) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const [y, m, d] = raw.split('-').map(Number);
        return new Date(y, m - 1, d);
    }
    const parts = raw.split(/[/-]/).map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    const [d, m, y] = parts;
    return new Date(y, m - 1, d);
}

function formatDateID(value) {
    const date = parseDateID(value);
    if (!date || Number.isNaN(date.getTime())) return '';
    return [
        String(date.getDate()).padStart(2, '0'),
        String(date.getMonth() + 1).padStart(2, '0'),
        date.getFullYear()
    ].join('/');
}

function toDateInputValue(value) {
    const date = parseDateID(value);
    if (!date || Number.isNaN(date.getTime())) return '';
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('-');
}

function formatShortDate(value) {
    const date = parseDateID(value);
    if (!date || Number.isNaN(date.getTime())) return String(value || '-');
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

function getSelectedYear() {
    const filter = document.getElementById('yearFilter');
    return filter?.value || localStorage.getItem(YEAR_KEY) || DEFAULT_YEAR;
}

function getScopedAbsensi() {
    const year = getSelectedYear();
    if (year === 'all') return DATA_ABSENSI;
    return DATA_ABSENSI.filter(record => {
        const date = parseDateID(record.tgl);
        return date && String(date.getFullYear()) === year;
    });
}

// Default data
const DEFAULT_KARYAWAN = [
    { id: 'K001', nama: 'Budi Santoso', kelamin: 'Laki-laki', jabatan: 'Kasir', tglMasuk: '01/01/2025', status: 'Aktif', gaji: 2500000 },
    { id: 'K002', nama: 'Rina Amelia', kelamin: 'Perempuan', jabatan: 'Barista', tglMasuk: '15/02/2025', status: 'Aktif', gaji: 2700000 },
    { id: 'K003', nama: 'Joko Prasetyo', kelamin: 'Laki-laki', jabatan: 'Koki', tglMasuk: '10/03/2025', status: 'Aktif', gaji: 2600000 },
    { id: 'K004', nama: 'Maya Lestari', kelamin: 'Perempuan', jabatan: 'Admin', tglMasuk: '05/04/2025', status: 'Aktif', gaji: 2400000 },
    { id: 'K005', nama: 'Sari Wulandari', kelamin: 'Perempuan', jabatan: 'Pelayan', tglMasuk: '20/05/2025', status: 'Aktif', gaji: 2300000 },
    { id: 'K006', nama: 'Adi Pratama', kelamin: 'Laki-laki', jabatan: 'Barista', tglMasuk: '01/06/2025', status: 'Aktif', gaji: 2700000 },
    { id: 'K007', nama: 'Dewi Sartika', kelamin: 'Perempuan', jabatan: 'Kasir', tglMasuk: '15/06/2025', status: 'Aktif', gaji: 2500000 },
    { id: 'K008', nama: 'Hendra Gunawan', kelamin: 'Laki-laki', jabatan: 'Koki', tglMasuk: '01/07/2025', status: 'Tidak Aktif', gaji: 2600000 },
    { id: 'K009', nama: 'Fitri Handayani', kelamin: 'Perempuan', jabatan: 'Pelayan', tglMasuk: '10/07/2025', status: 'Aktif', gaji: 2300000 },
    { id: 'K010', nama: 'Agus Wijaya', kelamin: 'Laki-laki', jabatan: 'Admin', tglMasuk: '20/08/2025', status: 'Aktif', gaji: 2400000 }
];

const DEFAULT_ABSENSI = [
    { tgl: '01/06/2026', id: 'K001', nama: 'Budi Santoso', jabatan: 'Kasir', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '01/06/2026', id: 'K002', nama: 'Rina Amelia', jabatan: 'Barista', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '01/06/2026', id: 'K003', nama: 'Joko Prasetyo', jabatan: 'Koki', status: 'Izin', ket: 'Keperluan keluarga' },
    { tgl: '01/06/2026', id: 'K004', nama: 'Maya Lestari', jabatan: 'Admin', status: 'Sakit', ket: 'Surat dokter' },
    { tgl: '01/06/2026', id: 'K005', nama: 'Sari Wulandari', jabatan: 'Pelayan', status: 'Alpha', ket: 'Tanpa keterangan' },
    { tgl: '01/06/2026', id: 'K006', nama: 'Adi Pratama', jabatan: 'Barista', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '01/06/2026', id: 'K007', nama: 'Dewi Sartika', jabatan: 'Kasir', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '01/06/2026', id: 'K008', nama: 'Hendra Gunawan', jabatan: 'Koki', status: 'Izin', ket: 'Keperluan keluarga' },
    { tgl: '01/06/2026', id: 'K009', nama: 'Fitri Handayani', jabatan: 'Pelayan', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '01/06/2026', id: 'K010', nama: 'Agus Wijaya', jabatan: 'Admin', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '02/06/2026', id: 'K001', nama: 'Budi Santoso', jabatan: 'Kasir', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '02/06/2026', id: 'K002', nama: 'Rina Amelia', jabatan: 'Barista', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '02/06/2026', id: 'K003', nama: 'Joko Prasetyo', jabatan: 'Koki', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '02/06/2026', id: 'K004', nama: 'Maya Lestari', jabatan: 'Admin', status: 'Hadir', ket: 'Kembali kerja' },
    { tgl: '02/06/2026', id: 'K005', nama: 'Sari Wulandari', jabatan: 'Pelayan', status: 'Sakit', ket: 'Demam' },
    { tgl: '02/06/2026', id: 'K006', nama: 'Adi Pratama', jabatan: 'Barista', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '02/06/2026', id: 'K007', nama: 'Dewi Sartika', jabatan: 'Kasir', status: 'Alpha', ket: 'Tanpa keterangan' },
    { tgl: '02/06/2026', id: 'K008', nama: 'Hendra Gunawan', jabatan: 'Koki', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '02/06/2026', id: 'K009', nama: 'Fitri Handayani', jabatan: 'Pelayan', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '02/06/2026', id: 'K010', nama: 'Agus Wijaya', jabatan: 'Admin', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '03/06/2026', id: 'K001', nama: 'Budi Santoso', jabatan: 'Kasir', status: 'Izin', ket: 'Acara keluarga' },
    { tgl: '03/06/2026', id: 'K002', nama: 'Rina Amelia', jabatan: 'Barista', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '03/06/2026', id: 'K003', nama: 'Joko Prasetyo', jabatan: 'Koki', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '03/06/2026', id: 'K004', nama: 'Maya Lestari', jabatan: 'Admin', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '03/06/2026', id: 'K005', nama: 'Sari Wulandari', jabatan: 'Pelayan', status: 'Hadir', ket: 'Sudah sembuh' },
    { tgl: '03/06/2026', id: 'K006', nama: 'Adi Pratama', jabatan: 'Barista', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '03/06/2026', id: 'K007', nama: 'Dewi Sartika', jabatan: 'Kasir', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '03/06/2026', id: 'K009', nama: 'Fitri Handayani', jabatan: 'Pelayan', status: 'Hadir', ket: 'Masuk tepat waktu' },
    { tgl: '03/06/2026', id: 'K010', nama: 'Agus Wijaya', jabatan: 'Admin', status: 'Sakit', ket: 'Sakit kepala' }
];

// Initialize from localStorage or defaults
const savedData = loadData();
let DATA_KARYAWAN = normalizeKaryawan(savedData ? savedData.karyawan : [...DEFAULT_KARYAWAN]);
let DATA_ABSENSI = normalizeAbsensi(savedData ? savedData.absensi : [...DEFAULT_ABSENSI]);

// ============================================================
// COMPUTED METRICS
// ============================================================
let totalKaryawan, aktif, tidakAktif, totalGaji, rataGaji, gajiTertinggi, gajiTerendah;
let laki, perempuan, jabatanCount, hadir, izin, sakit, alpha, totalAbsensi, persenHadir, gajiPerJabatan;

function recomputeMetrics() {
    const scopedAbsensi = getScopedAbsensi();
    totalKaryawan = DATA_KARYAWAN.length;
    aktif = DATA_KARYAWAN.filter(k => k.status === 'Aktif').length;
    tidakAktif = DATA_KARYAWAN.filter(k => k.status !== 'Aktif').length;
    totalGaji = DATA_KARYAWAN.reduce((s, k) => s + k.gaji, 0);
    rataGaji = totalKaryawan > 0 ? Math.round(totalGaji / totalKaryawan) : 0;
    gajiTertinggi = DATA_KARYAWAN.length > 0 ? Math.max(...DATA_KARYAWAN.map(k => k.gaji)) : 0;
    gajiTerendah = DATA_KARYAWAN.length > 0 ? Math.min(...DATA_KARYAWAN.map(k => k.gaji)) : 0;
    laki = DATA_KARYAWAN.filter(k => k.kelamin === 'Laki-laki').length;
    perempuan = DATA_KARYAWAN.filter(k => k.kelamin === 'Perempuan').length;
    jabatanCount = {};
    DATA_KARYAWAN.forEach(k => { jabatanCount[k.jabatan] = (jabatanCount[k.jabatan] || 0) + 1; });
    hadir = scopedAbsensi.filter(a => a.status === 'Hadir').length;
    izin = scopedAbsensi.filter(a => a.status === 'Izin').length;
    sakit = scopedAbsensi.filter(a => a.status === 'Sakit').length;
    alpha = scopedAbsensi.filter(a => a.status === 'Alpha').length;
    totalAbsensi = hadir + izin + sakit + alpha;
    persenHadir = totalAbsensi > 0 ? ((hadir / totalAbsensi) * 100).toFixed(1) : 0;
    gajiPerJabatan = {};
    DATA_KARYAWAN.forEach(k => {
        if (k.status === 'Aktif') { gajiPerJabatan[k.jabatan] = (gajiPerJabatan[k.jabatan] || 0) + k.gaji; }
    });
}

recomputeMetrics();

function formatRupiah(n) {
    return 'Rp ' + (Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ============================================================
// TOAST SYSTEM
// ============================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    const icons = { success: 'fa-circle-check', warning: 'fa-triangle-exclamation', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    t.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i><span></span>`;
    t.querySelector('span').textContent = message;
    container.appendChild(t);
    setTimeout(() => { t.classList.add('fade-out'); setTimeout(() => t.remove(), 300); }, prefersReducedMotion ? 1800 : 3000);
}

// ============================================================
// ANIMATED COUNTER
// ============================================================
function animateCounter(el, target, suffix = '', duration = 1200) {
    if (prefersReducedMotion) {
        el.textContent = (typeof target === 'number' ? target.toLocaleString('id-ID') : target) + suffix;
        return;
    }
    const start = performance.now();
    function update(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const current = Math.round(0 + (target - 0) * eased);
        el.textContent = current.toLocaleString('id-ID') + suffix;
        if (p < 1) requestAnimationFrame(update);
        else el.textContent = (typeof target === 'number' ? target.toLocaleString('id-ID') : target) + suffix;
    }
    requestAnimationFrame(update);
}

// ============================================================
// PARTICLES
// ============================================================
(function() {
    const container = document.getElementById('particleField');
    if (!container || prefersReducedMotion || window.innerWidth < 640) return;
    const particleCount = window.innerWidth > 1280 ? 14 : 8;
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div'); p.className = 'particle';
        const s = 2 + Math.random() * 4;
        p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*100}%;animation-duration:${15+Math.random()*25}s;animation-delay:${Math.random()*20}s`;
        container.appendChild(p);
    }
})();

// ============================================================
// SMART ALERTS
// ============================================================
function checkAlerts() {
    const banner = document.getElementById('alertBanner');
    const text = document.getElementById('alertText');
    const count = document.getElementById('alertCount');
    
    // Check for Alpha status employees in the active year scope.
    const alphaRecords = getScopedAbsensi().filter(a => a.status === 'Alpha');
    const alphaNames = [...new Set(alphaRecords.map(a => a.nama))];
    const inactiveCount = DATA_KARYAWAN.filter(k => k.status !== 'Aktif').length;
    
    let alerts = [];
    if (alphaNames.length > 0) alerts.push(`${alphaRecords.length} catatan Alpha (${alphaNames.join(', ')})`);
    if (inactiveCount > 0) alerts.push(`${inactiveCount} karyawan tidak aktif`);
    if (parseFloat(persenHadir) < 75) alerts.push(`Kehadiran ${persenHadir}% (target >75%)`);
    
    if (alerts.length > 0) {
        banner.classList.add('show');
        text.innerHTML = `<strong>${alerts.length} perhatian:</strong> ${alerts.map(escapeHTML).join(' - ')}`;
        count.textContent = alerts.length;
    } else {
        banner.classList.remove('show');
        count.textContent = '0';
    }
}

// ============================================================
// KPI BUILDER
// ============================================================
function buildKPI(containerId, cards) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = cards.map(c => `
        <div class="kpi-card kpi-${c.color}">
            <div class="kpi-glow"></div>
            <div class="kpi-top"><div class="kpi-icon">${c.icon}</div></div>
            <div class="kpi-label">${c.label}</div>
            <div class="kpi-value"><span class="kpi-counter" data-target="${c.raw ?? c.value}" data-suffix="${c.suffix || ''}">0</span></div>
            ${c.sub ? `<div class="kpi-sub ${c.subClass || ''}"><i class="fas fa-${c.subIcon || 'info-circle'}"></i> ${c.sub}</div>` : ''}
        </div>
    `).join('');
    setTimeout(() => {
        el.querySelectorAll('.kpi-counter').forEach(counter => {
            const target = parseFloat(counter.dataset.target);
            const suffix = counter.dataset.suffix || '';
            if (!isNaN(target)) animateCounter(counter, target, suffix);
            else counter.textContent = counter.dataset.target + suffix;
        });
    }, 200);
}

function refreshAllKPIs() {
    buildKPI('kpiDashboard', [
        { icon: '<i class="fas fa-users"></i>', label: 'Total Karyawan', raw: totalKaryawan, suffix: ' Orang', color: 'gold', sub: 'Seluruh karyawan', subIcon: 'users' },
        { icon: '<i class="fas fa-check-circle"></i>', label: 'Karyawan Aktif', raw: aktif, suffix: ' Orang', color: 'teal', sub: ((aktif/totalKaryawan)*100||0).toFixed(0) + '%', subIcon: 'percent' },
        { icon: '<i class="fas fa-clipboard-list"></i>', label: 'Total Hadir', raw: hadir, suffix: '', color: 'blue', sub: 'Dari ' + totalAbsensi + ' records', subIcon: 'database' },
        { icon: '<i class="fas fa-money-bill-wave"></i>', label: 'Total Gaji Pokok', raw: totalGaji, suffix: '', color: 'gold', sub: 'Per bulan', subIcon: 'calendar' },
        { icon: '<i class="fas fa-chart-line"></i>', label: 'Kehadiran', raw: parseFloat(persenHadir||'0'), suffix: '%', color: 'teal', sub: parseFloat(persenHadir) >= 70 ? 'Cukup baik' : 'Perlu ditingkatkan', subIcon: 'check', subClass: parseFloat(persenHadir) >= 70 ? '' : 'danger' }
    ]);
    buildKPI('kpiKeuangan', [
        { icon: '<i class="fas fa-coins"></i>', label: 'Total Gaji', raw: totalGaji, suffix: '', color: 'gold', sub: 'Beban per bulan', subIcon: 'calendar' },
        { icon: '<i class="fas fa-calculator"></i>', label: 'Rata-rata Gaji', raw: rataGaji, suffix: '', color: 'teal', sub: 'Per karyawan', subIcon: 'user' },
        { icon: '<i class="fas fa-arrow-up"></i>', label: 'Gaji Tertinggi', raw: gajiTertinggi, suffix: '', color: 'purple', sub: 'Barista', subIcon: 'star' },
        { icon: '<i class="fas fa-arrow-down"></i>', label: 'Gaji Terendah', raw: gajiTerendah, suffix: '', color: 'blue', sub: 'Pelayan / Admin', subIcon: 'flag' }
    ]);
    buildKPI('kpiKaryawan', [
        { icon: '<i class="fas fa-users"></i>', label: 'Total', raw: totalKaryawan, suffix: ' Orang', color: 'gold', sub: 'Terdaftar', subIcon: 'check' },
        { icon: '<i class="fas fa-check-circle"></i>', label: 'Aktif', raw: aktif, suffix: ' Orang', color: 'teal', sub: ((aktif/totalKaryawan)*100||0).toFixed(0) + '%', subIcon: 'percent' },
        { icon: '<i class="fas fa-times-circle"></i>', label: 'Tidak Aktif', raw: tidakAktif, suffix: ' Orang', color: 'red', sub: 'Resign', subIcon: 'user-slash' },
        { icon: '<i class="fas fa-mars"></i>', label: 'Laki-laki', raw: laki, suffix: ' Orang', color: 'blue', sub: totalKaryawan > 0 ? ((laki/totalKaryawan)*100).toFixed(0) + '%' : '0%', subIcon: 'equals' },
        { icon: '<i class="fas fa-venus"></i>', label: 'Perempuan', raw: perempuan, suffix: ' Orang', color: 'pink', sub: totalKaryawan > 0 ? ((perempuan/totalKaryawan)*100).toFixed(0) + '%' : '0%', subIcon: 'equals' }
    ]);
    buildKPI('kpiAbsensi', [
        { icon: '<i class="fas fa-check"></i>', label: 'Hadir', raw: hadir, suffix: '', color: 'teal', sub: totalAbsensi > 0 ? ((hadir/totalAbsensi)*100).toFixed(0) + '%' : '0%', subIcon: 'percent' },
        { icon: '<i class="fas fa-pen"></i>', label: 'Izin', raw: izin, suffix: '', color: 'gold', sub: totalAbsensi > 0 ? ((izin/totalAbsensi)*100).toFixed(0) + '%' : '0%', subIcon: 'percent' },
        { icon: '<i class="fas fa-thermometer-half"></i>', label: 'Sakit', raw: sakit, suffix: '', color: 'blue', sub: totalAbsensi > 0 ? ((sakit/totalAbsensi)*100).toFixed(0) + '%' : '0%', subIcon: 'percent' },
        { icon: '<i class="fas fa-exclamation-triangle"></i>', label: 'Alpha', raw: alpha, suffix: '', color: 'red', sub: 'Evaluasi!', subIcon: 'exclamation', subClass: 'danger' }
    ]);
    checkAlerts();
}

// ============================================================
// PROGRESS BARS
// ============================================================
function buildProgress() {
    const el = document.getElementById('progressDashboard');
    if (!el) return;
    const items = [
        { label: 'Karyawan Aktif', value: aktif + '/' + totalKaryawan + ' (' + ((aktif/totalKaryawan)*100||0).toFixed(0) + '%)', percent: totalKaryawan > 0 ? (aktif/totalKaryawan)*100 : 0 },
        { label: 'Tingkat Kehadiran', value: hadir + '/' + totalAbsensi + ' (' + (persenHadir || '0') + '%)', percent: Math.round(parseFloat(persenHadir || '0')), color: parseFloat(persenHadir) >= 70 ? '' : 'red' },
        { label: 'Karyawan Perempuan', value: perempuan + '/' + totalKaryawan + ' (' + (totalKaryawan > 0 ? ((perempuan/totalKaryawan)*100).toFixed(0) : '0') + '%)', percent: totalKaryawan > 0 ? (perempuan/totalKaryawan)*100 : 0, color: 'purple' },
        { label: 'Efisiensi Gaji (vs target 30jt)', value: formatRupiah(totalGaji) + ' / Rp30.000.000', percent: (totalGaji / 30000000) * 100, color: 'blue' }
    ];
    el.innerHTML = items.map(i => `
        <div class="progress-item">
            <div class="progress-header"><span>${i.label}</span><span>${i.value}</span></div>
            <div class="progress-track"><div class="progress-fill ${i.color || ''}" style="width:0%" data-target="${Math.min(i.percent, 100)}"></div></div>
        </div>
    `).join('');
    setTimeout(() => {
        el.querySelectorAll('.progress-fill').forEach(f => { f.style.width = f.dataset.target + '%'; });
    }, 400);
}

function buildAdvancedInsights() {
    const el = document.getElementById('advancedInsights');
    if (!el) return;

    const scopedAbsensi = getScopedAbsensi();
    const attendanceScore = Number(persenHadir) || 0;
    const alphaByEmployee = DATA_KARYAWAN.map(k => {
        const records = scopedAbsensi.filter(a => a.id === k.id);
        const hadirCount = records.filter(a => a.status === 'Hadir').length;
        const alphaCount = records.filter(a => a.status === 'Alpha').length;
        return {
            nama: k.nama,
            jabatan: k.jabatan,
            records: records.length,
            alpha: alphaCount,
            score: records.length ? Math.round((hadirCount / records.length) * 100) : 0
        };
    });
    const risky = alphaByEmployee
        .filter(item => item.records > 0)
        .sort((a, b) => b.alpha - a.alpha || a.score - b.score)[0];
    const best = alphaByEmployee
        .filter(item => item.records > 0)
        .sort((a, b) => b.score - a.score || a.alpha - b.alpha)[0];
    const attendanceClass = attendanceScore >= 85 ? 'good' : attendanceScore >= 70 ? 'warning' : 'danger';
    const payrollRatio = totalGaji ? Math.round((totalGaji / 30000000) * 100) : 0;
    const selectedYear = getSelectedYear();

    const cards = [
        {
            icon: 'fa-gauge-high',
            label: 'Skor Kehadiran',
            value: attendanceScore.toFixed(1) + '%',
            note: selectedYear === 'all' ? 'Menggunakan seluruh tahun absensi.' : `Scope absensi tahun ${selectedYear}.`,
            tone: attendanceClass
        },
        {
            icon: 'fa-user-shield',
            label: 'Risiko Alpha',
            value: risky && risky.alpha > 0 ? risky.nama : 'Stabil',
            note: risky && risky.alpha > 0 ? `${risky.alpha} catatan alpha - ${risky.jabatan}.` : 'Tidak ada alpha pada scope aktif.',
            tone: risky && risky.alpha > 0 ? 'danger' : 'good'
        },
        {
            icon: 'fa-sack-dollar',
            label: 'Payroll Tahunan',
            value: formatRupiah(totalGaji * 12),
            note: `${payrollRatio}% dari target biaya bulanan Rp30.000.000.`,
            tone: payrollRatio <= 80 ? 'good' : payrollRatio <= 100 ? 'warning' : 'danger'
        },
        {
            icon: 'fa-ranking-star',
            label: 'Top Attendance',
            value: best ? best.nama : 'Belum ada',
            note: best ? `${best.score}% hadir dari ${best.records} catatan.` : 'Tambahkan absensi untuk melihat performa.',
            tone: best && best.score >= 85 ? 'good' : 'warning'
        }
    ];

    el.innerHTML = cards.map(card => `
        <div class="advanced-card ${card.tone}">
            <div class="advanced-top">
                <div>
                    <div class="advanced-label">${escapeHTML(card.label)}</div>
                    <div class="advanced-value">${escapeHTML(card.value)}</div>
                </div>
                <div class="advanced-icon"><i class="fas ${escapeHTML(card.icon)}"></i></div>
            </div>
            <div class="advanced-note">${escapeHTML(card.note)}</div>
        </div>
    `).join('');
}

// ============================================================
// TABLE RENDERERS
// ============================================================
let karyawanSortCol = null, karyawanSortDir = 1;
let absensiSortCol = null, absensiSortDir = 1;

function renderKaryawanTable(data) {
    const tbody = document.getElementById('tableKaryawan');
    if (!tbody) return;
    const count = document.getElementById('karyawanCount');
    if (count) count.textContent = data.length;
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="table-empty"><i class="fas fa-search"></i> Tidak ada data</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(k => `
        <tr class="clickable" data-id="${escapeHTML(k.id)}">
            <td><strong style="color:var(--secondary)">${escapeHTML(k.id)}</strong></td>
            <td><strong>${escapeHTML(k.nama)}</strong></td>
            <td class="${k.kelamin === 'Laki-laki' ? 'gender-male' : 'gender-female'}"><i class="fas fa-${k.kelamin === 'Laki-laki' ? 'mars' : 'venus'}"></i> ${escapeHTML(k.kelamin)}</td>
            <td>${escapeHTML(k.jabatan)}</td>
            <td>${escapeHTML(k.tglMasuk)}</td>
            <td><span class="status-badge ${k.status === 'Aktif' ? 'status-hadir' : 'status-inactive'}">${k.status}</span></td>
            <td><strong>${formatRupiah(k.gaji)}</strong></td>
            <td>
                <div class="table-actions">
                    <button class="action-btn view" data-id="${escapeHTML(k.id)}" title="Lihat Detail"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit" data-id="${escapeHTML(k.id)}" title="Edit"><i class="fas fa-pen"></i></button>
                    <button class="action-btn delete" data-id="${escapeHTML(k.id)}" title="Hapus"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');

    // Event listeners for action buttons
    tbody.querySelectorAll('.view').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); showEmployeeDetail(btn.dataset.id); }));
    tbody.querySelectorAll('.edit').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); editEmployee(btn.dataset.id); }));
    tbody.querySelectorAll('.delete').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); deleteEmployee(btn.dataset.id); }));
    // Click row to view detail
    tbody.querySelectorAll('tr.clickable').forEach(row => row.addEventListener('click', function() { showEmployeeDetail(this.dataset.id); }));
}

function renderAbsensiTable(data) {
    const tbody = document.getElementById('tableAbsensi');
    if (!tbody) return;
    const count = document.getElementById('absensiCount');
    if (count) count.textContent = data.length;
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="table-empty"><i class="fas fa-search"></i> Tidak ada data</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(a => `
        <tr>
            <td>${escapeHTML(a.tgl)}</td>
            <td style="color:var(--secondary)">${escapeHTML(a.id)}</td>
            <td>${escapeHTML(a.nama)}</td>
            <td>${escapeHTML(a.jabatan)}</td>
            <td><span class="status-badge status-${a.status.toLowerCase()}">${a.status}</span></td>
            <td>${escapeHTML(a.ket)}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit abs-edit" data-rid="${escapeHTML(a.rid)}" title="Edit"><i class="fas fa-pen"></i></button>
                    <button class="action-btn delete abs-delete" data-rid="${escapeHTML(a.rid)}" title="Hapus"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
    tbody.querySelectorAll('.abs-edit').forEach(btn => btn.addEventListener('click', () => editAbsensi(btn.dataset.rid)));
    tbody.querySelectorAll('.abs-delete').forEach(btn => btn.addEventListener('click', () => deleteAbsensi(btn.dataset.rid)));
}

// Search & Sort
function filterKaryawan(query) {
    const q = normalizeText(query);
    return DATA_KARYAWAN.filter(k =>
        normalizeText(k.id).includes(q) || normalizeText(k.nama).includes(q) ||
        normalizeText(k.jabatan).includes(q) || normalizeText(k.kelamin).includes(q) ||
        normalizeText(k.status).includes(q) || String(k.gaji).includes(q)
    );
}

function filterAbsensi(query) {
    const q = normalizeText(query);
    return getScopedAbsensi().filter(a =>
        normalizeText(a.id).includes(q) || normalizeText(a.nama).includes(q) ||
        normalizeText(a.jabatan).includes(q) || normalizeText(a.status).includes(q) ||
        normalizeText(a.tgl).includes(q) || normalizeText(a.ket).includes(q)
    );
}

function sortData(data, col, dir) {
    return [...data].sort((a, b) => {
        let va = a[col], vb = b[col];
        if (col === 'gaji') { va = Number(va); vb = Number(vb); }
        if (col === 'tglMasuk' || col === 'tgl') return dir * ((parseDateID(va)?.getTime() || 0) - (parseDateID(vb)?.getTime() || 0));
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
    });
}

function refreshKaryawan(queryOverride) {
    const q = queryOverride ?? document.getElementById('searchKaryawan')?.value ?? '';
    let data = filterKaryawan(q);
    if (karyawanSortCol) data = sortData(data, karyawanSortCol, karyawanSortDir);
    renderKaryawanTable(data);
}

function refreshAbsensi(queryOverride) {
    const q = queryOverride ?? document.getElementById('searchAbsensi')?.value ?? '';
    let data = filterAbsensi(q);
    if (absensiSortCol) data = sortData(data, absensiSortCol, absensiSortDir);
    renderAbsensiTable(data);
}

// ============================================================
// LAPORAN TABLE
// ============================================================
function buildTableLaporan() {
    const tbody = document.getElementById('tableLaporan');
    if (!tbody) return;
    const selectedYear = getSelectedYear();
    const rows = [
        ['Filter Tahun Absensi', selectedYear === 'all' ? 'Semua tahun' : selectedYear, 'Scope perhitungan absensi'],
        ['Total Karyawan', totalKaryawan, 'Seluruh karyawan terdaftar'],
        ['Karyawan Aktif', aktif, 'Karyawan dengan status aktif'],
        ['Karyawan Tidak Aktif', tidakAktif, 'Karyawan non-aktif'],
        ['Total Laki-laki', laki, 'Karyawan pria'],
        ['Total Perempuan', perempuan, 'Karyawan wanita'],
        ['Total Gaji Pokok', formatRupiah(totalGaji), 'Beban gaji per bulan'],
        ['Rata-rata Gaji', formatRupiah(rataGaji), 'Rata-rata gaji karyawan'],
        ['Total Hadir', hadir, 'Kehadiran penuh'],
        ['Total Izin', izin, 'Izin tidak masuk'],
        ['Total Sakit', sakit, 'Sakit'],
        ['Total Alpha', alpha, 'Tanpa keterangan'],
        ['Persentase Kehadiran', persenHadir + '%', 'Tingkat kehadiran']
    ];
    tbody.innerHTML = rows.map(r => `<tr><td style="font-weight:600;color:var(--text-primary)">${escapeHTML(r[0])}</td><td><strong>${escapeHTML(r[1])}</strong></td><td>${escapeHTML(r[2])}</td></tr>`).join('');
    
    const kesimpulan = document.getElementById('laporanKesimpulan');
    if (kesimpulan) {
        kesimpulan.innerHTML = `
            <li><span class="num">1</span> Total <strong>${totalKaryawan}</strong> karyawan, <strong>${aktif}</strong> aktif, <strong>${tidakAktif}</strong> tidak aktif.</li>
            <li><span class="num">2</span> Komposisi: <strong>${laki}</strong> laki-laki, <strong>${perempuan}</strong> perempuan.</li>
            <li><span class="num">3</span> Kehadiran: <strong>${persenHadir}%</strong> - ${parseFloat(persenHadir) >= 70 ? 'cukup baik' : 'perlu ditingkatkan'}.</li>
            <li><span class="num">4</span> Beban gaji: <strong>${formatRupiah(totalGaji)}</strong>/bulan (${formatRupiah(totalGaji * 12)}/tahun).</li>
            <li><span class="num">5</span> <strong>Rekomendasi:</strong> Evaluasi Alpha, pertimbangkan hiring musiman, optimalkan biaya tenaga kerja.</li>
        `;
    }
}

// ============================================================
// EMPLOYEE CRUD
// ============================================================
function getNextId() {
    const ids = DATA_KARYAWAN.map(k => parseInt(k.id.replace('K', ''))).filter(n => !isNaN(n));
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    return 'K' + String(maxId + 1).padStart(3, '0');
}

function openModal(title, bodyHtml, footerHtml) {
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    overlay.classList.add('show');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalFooter').innerHTML = footerHtml || '';
    document.body.classList.add('modal-open');
    setTimeout(() => overlay.querySelector('.modal-body input, .modal-body select, .modal-body textarea, .modal-footer button')?.focus(), 60);
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
    document.body.classList.remove('modal-open');
}

function clearFormErrors() {
    document.querySelectorAll('.form-group.error').forEach(group => group.classList.remove('error'));
}

// Add Employee
function addEmployee() {
    openModal('Tambah Karyawan Baru', `
        <div class="form-row">
            <div class="form-group">
                <label>ID Karyawan</label>
                <input type="text" id="formId" value="${getNextId()}" readonly style="opacity:0.6">
            </div>
            <div class="form-group">
                <label>Nama Karyawan <span style="color:var(--accent-2)">*</span></label>
                <input type="text" id="formNama" placeholder="Nama lengkap" required>
                <div class="form-error">Nama harus diisi</div>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Jenis Kelamin</label>
                <select id="formKelamin">
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                </select>
            </div>
            <div class="form-group">
                <label>Jabatan</label>
                <select id="formJabatan">
                    ${JABATAN_LIST.map(j => `<option value="${j}">${j}</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Tanggal Masuk</label>
                <input type="date" id="formTgl" value="${toDateInputValue(new Date())}">
                <div class="form-error">Tanggal harus diisi</div>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="formStatus">
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Gaji Pokok <span style="color:var(--accent-2)">*</span></label>
            <input type="number" id="formGaji" placeholder="2500000" min="1000000">
            <div class="form-error">Gaji minimal Rp1.000.000</div>
        </div>
    `, `
        <button class="btn" onclick="closeModal()">Batal</button>
        <button class="btn btn-primary" onclick="saveEmployee()"><i class="fas fa-save"></i> Simpan</button>
    `);
}

// Edit Employee
function editEmployee(id) {
    const k = DATA_KARYAWAN.find(x => x.id === id);
    if (!k) return;
    openModal('Edit Karyawan', `
        <div class="form-row">
            <div class="form-group">
                <label>ID</label>
                <input type="text" value="${escapeHTML(k.id)}" readonly style="opacity:0.6">
                <input type="hidden" id="formEditId" value="${escapeHTML(k.id)}">
            </div>
            <div class="form-group">
                <label>Nama</label>
                <input type="text" id="formNama" value="${escapeHTML(k.nama)}">
                <div class="form-error">Nama harus diisi</div>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Jenis Kelamin</label>
                <select id="formKelamin"><option value="Laki-laki" ${k.kelamin==='Laki-laki'?'selected':''}>Laki-laki</option><option value="Perempuan" ${k.kelamin==='Perempuan'?'selected':''}>Perempuan</option></select>
            </div>
            <div class="form-group">
                <label>Jabatan</label>
                <select id="formJabatan">
                    ${JABATAN_LIST.map(j => `<option value="${j}" ${k.jabatan===j?'selected':''}>${j}</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Tanggal Masuk</label>
                <input type="date" id="formTgl" value="${toDateInputValue(k.tglMasuk)}">
                <div class="form-error">Tanggal harus diisi</div>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="formStatus"><option value="Aktif" ${k.status==='Aktif'?'selected':''}>Aktif</option><option value="Tidak Aktif" ${k.status==='Tidak Aktif'?'selected':''}>Tidak Aktif</option></select>
            </div>
        </div>
        <div class="form-group">
            <label>Gaji Pokok</label>
            <input type="number" id="formGaji" value="${k.gaji}" min="1000000">
            <div class="form-error">Gaji minimal Rp1.000.000</div>
        </div>
    `, `
        <button class="btn" onclick="closeModal()">Batal</button>
        <button class="btn btn-primary" onclick="updateEmployee()"><i class="fas fa-save"></i> Update</button>
    `);
}

// Save new employee
window.saveEmployee = function() {
    clearFormErrors();
    const nama = document.getElementById('formNama').value.trim();
    const gaji = parseInt(document.getElementById('formGaji').value);
    const tglMasuk = formatDateID(document.getElementById('formTgl').value);
    
    if (!nama) { document.getElementById('formNama').parentElement.classList.add('error'); return; }
    if (!tglMasuk) { document.getElementById('formTgl').parentElement.classList.add('error'); return; }
    if (!gaji || gaji < 1000000) { document.getElementById('formGaji').parentElement.classList.add('error'); return; }
    
    DATA_KARYAWAN.push({
        id: document.getElementById('formId').value,
        nama: nama,
        kelamin: document.getElementById('formKelamin').value,
        jabatan: document.getElementById('formJabatan').value,
        tglMasuk: tglMasuk,
        status: document.getElementById('formStatus').value,
        gaji: gaji
    });
    saveData();
    closeModal();
    fullRefresh();
    showToast('Karyawan berhasil ditambahkan!', 'success');
};

// Update employee
window.updateEmployee = function() {
    clearFormErrors();
    const id = document.getElementById('formEditId').value;
    const idx = DATA_KARYAWAN.findIndex(k => k.id === id);
    if (idx === -1) return;
    
    const nama = document.getElementById('formNama').value.trim();
    const gaji = parseInt(document.getElementById('formGaji').value);
    const jabatan = document.getElementById('formJabatan').value;
    const tglMasuk = formatDateID(document.getElementById('formTgl').value);
    if (!nama) { document.getElementById('formNama').parentElement.classList.add('error'); return; }
    if (!tglMasuk) { document.getElementById('formTgl').parentElement.classList.add('error'); return; }
    if (!gaji || gaji < 1000000) { document.getElementById('formGaji').parentElement.classList.add('error'); return; }
    
    DATA_KARYAWAN[idx] = {
        ...DATA_KARYAWAN[idx],
        nama: nama,
        kelamin: document.getElementById('formKelamin').value,
        jabatan: jabatan,
        tglMasuk: tglMasuk,
        status: document.getElementById('formStatus').value,
        gaji: gaji
    };
    DATA_ABSENSI = DATA_ABSENSI.map(a => a.id === id ? { ...a, nama, jabatan } : a);
    saveData();
    closeModal();
    fullRefresh();
    showToast('Karyawan berhasil diupdate!', 'success');
};

// Delete employee
window.deleteEmployee = function(id) {
    const relatedAbsensi = DATA_ABSENSI.filter(a => a.id === id).length;
    const message = relatedAbsensi > 0
        ? `Hapus karyawan ${id} dan ${relatedAbsensi} catatan absensi terkait?`
        : `Hapus karyawan ${id}?`;
    if (!confirm(message)) return;
    DATA_KARYAWAN = DATA_KARYAWAN.filter(k => k.id !== id);
    DATA_ABSENSI = DATA_ABSENSI.filter(a => a.id !== id);
    saveData();
    fullRefresh();
    showToast('Karyawan dihapus!', 'warning');
};

// ============================================================
// EMPLOYEE DETAIL MODAL
// ============================================================
function showEmployeeDetail(id) {
    const k = DATA_KARYAWAN.find(x => x.id === id);
    if (!k) return;
    const scopedAbsensi = getScopedAbsensi();
    const absenCount = scopedAbsensi.filter(a => a.id === id).length;
    const absenHadir = scopedAbsensi.filter(a => a.id === id && a.status === 'Hadir').length;
    
    openModal('Detail Karyawan', `
        <div class="detail-avatar">${escapeHTML(k.nama.charAt(0))}</div>
        <div class="detail-name">${escapeHTML(k.nama)}</div>
        <div class="detail-role">${escapeHTML(k.jabatan)} - ${escapeHTML(k.id)}</div>
        <div class="detail-grid">
            <div class="detail-item"><div class="detail-label">Status</div><div class="detail-value"><span class="status-badge ${k.status === 'Aktif' ? 'status-hadir' : 'status-inactive'}">${k.status}</span></div></div>
            <div class="detail-item"><div class="detail-label">Jenis Kelamin</div><div class="detail-value">${escapeHTML(k.kelamin)}</div></div>
            <div class="detail-item"><div class="detail-label">Tanggal Masuk</div><div class="detail-value">${escapeHTML(k.tglMasuk)}</div></div>
            <div class="detail-item"><div class="detail-label">Gaji Pokok</div><div class="detail-value" style="color:var(--secondary)">${formatRupiah(k.gaji)}</div></div>
            <div class="detail-item"><div class="detail-label">Total Absensi</div><div class="detail-value">${absenCount} records</div></div>
            <div class="detail-item"><div class="detail-label">Kehadiran</div><div class="detail-value" style="color:var(--accent-1)">${absenCount > 0 ? (absenHadir/absenCount*100).toFixed(0) + '%' : 'N/A'}</div></div>
        </div>
    `, `<button class="btn" onclick="closeModal()">Tutup</button>`);
}

// ============================================================
// ABSENSI CRUD
// ============================================================
function addAbsensi() {
    const today = toDateInputValue(new Date());
    const karyawanOpts = DATA_KARYAWAN.filter(k => k.status === 'Aktif').map(k =>
        `<option value="${escapeHTML(k.id)}">${escapeHTML(k.id)} - ${escapeHTML(k.nama)} (${escapeHTML(k.jabatan)})</option>`
    ).join('');
    if (!karyawanOpts) {
        openModal('Tambah Absensi', '<p class="table-empty">Tidak ada karyawan aktif untuk ditambahkan ke absensi.</p>', '<button class="btn" onclick="closeModal()">Tutup</button>');
        return;
    }
    
    openModal('Tambah Absensi', `
        <div class="form-row">
            <div class="form-group">
                <label>Tanggal</label>
                <input type="date" id="absTgl" value="${today}">
                <div class="form-error">Tanggal harus diisi</div>
            </div>
            <div class="form-group">
                <label>Karyawan</label>
                <select id="absKaryawan">${karyawanOpts}</select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Status Kehadiran</label>
                <select id="absStatus">
                    ${STATUS_LIST.map(status => `<option value="${status}">${status}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Keterangan</label>
                <input type="text" id="absKet" placeholder="Opsional">
            </div>
        </div>
    `, `
        <button class="btn" onclick="closeModal()">Batal</button>
        <button class="btn btn-primary" onclick="saveAbsensi()"><i class="fas fa-save"></i> Simpan</button>
    `);
}

window.saveAbsensi = function() {
    clearFormErrors();
    const karyawanId = document.getElementById('absKaryawan').value;
    const k = DATA_KARYAWAN.find(x => x.id === karyawanId);
    const tgl = formatDateID(document.getElementById('absTgl').value);
    if (!k) return;
    if (!tgl) { document.getElementById('absTgl').parentElement.classList.add('error'); return; }
    
    DATA_ABSENSI.push({
        rid: createAbsensiRid(),
        tgl: tgl,
        id: karyawanId,
        nama: k.nama,
        jabatan: k.jabatan,
        status: document.getElementById('absStatus').value,
        ket: document.getElementById('absKet').value || '-'
    });
    saveData();
    closeModal();
    fullRefresh();
    showToast('Absensi berhasil ditambahkan!', 'success');
};

function editAbsensi(rid) {
    const record = DATA_ABSENSI.find(a => a.rid === rid);
    if (!record) return;
    const karyawanOpts = DATA_KARYAWAN
        .filter(k => k.status === 'Aktif' || k.id === record.id)
        .map(k => `<option value="${escapeHTML(k.id)}" ${k.id === record.id ? 'selected' : ''}>${escapeHTML(k.id)} - ${escapeHTML(k.nama)} (${escapeHTML(k.jabatan)})</option>`)
        .join('');

    openModal('Edit Absensi', `
        <input type="hidden" id="absRid" value="${escapeHTML(record.rid)}">
        <div class="form-row">
            <div class="form-group">
                <label>Tanggal</label>
                <input type="date" id="absTgl" value="${toDateInputValue(record.tgl)}">
                <div class="form-error">Tanggal harus diisi</div>
            </div>
            <div class="form-group">
                <label>Karyawan</label>
                <select id="absKaryawan">${karyawanOpts}</select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Status Kehadiran</label>
                <select id="absStatus">
                    ${STATUS_LIST.map(status => `<option value="${status}" ${status === record.status ? 'selected' : ''}>${status}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Keterangan</label>
                <input type="text" id="absKet" value="${escapeHTML(record.ket)}" placeholder="Opsional">
            </div>
        </div>
    `, `
        <button class="btn" onclick="closeModal()">Batal</button>
        <button class="btn btn-primary" onclick="updateAbsensi()"><i class="fas fa-save"></i> Update</button>
    `);
}

window.updateAbsensi = function() {
    clearFormErrors();
    const rid = document.getElementById('absRid').value;
    const idx = DATA_ABSENSI.findIndex(a => a.rid === rid);
    const karyawanId = document.getElementById('absKaryawan').value;
    const k = DATA_KARYAWAN.find(x => x.id === karyawanId);
    const tgl = formatDateID(document.getElementById('absTgl').value);
    if (idx === -1 || !k) return;
    if (!tgl) { document.getElementById('absTgl').parentElement.classList.add('error'); return; }

    DATA_ABSENSI[idx] = {
        ...DATA_ABSENSI[idx],
        tgl: tgl,
        id: karyawanId,
        nama: k.nama,
        jabatan: k.jabatan,
        status: document.getElementById('absStatus').value,
        ket: document.getElementById('absKet').value.trim() || '-'
    };
    saveData();
    closeModal();
    fullRefresh();
    showToast('Absensi berhasil diupdate!', 'success');
};

function deleteAbsensi(rid) {
    const record = DATA_ABSENSI.find(a => a.rid === rid);
    if (!record) return;
    if (!confirm(`Hapus absensi ${record.nama} pada ${record.tgl}?`)) return;
    DATA_ABSENSI = DATA_ABSENSI.filter(a => a.rid !== rid);
    saveData();
    fullRefresh();
    showToast('Absensi dihapus!', 'warning');
}

// ============================================================
// RESET DATA
// ============================================================
function resetData() {
    if (!confirm('Reset semua data ke awal? Data custom akan hilang.')) return;
    DATA_KARYAWAN = normalizeKaryawan([...DEFAULT_KARYAWAN]);
    DATA_ABSENSI = normalizeAbsensi([...DEFAULT_ABSENSI]);
    saveData();
    fullRefresh();
    showToast('Data direset ke default!', 'info');
}

// ============================================================
// FULL REFRESH
// ============================================================
function fullRefresh() {
    recomputeMetrics();
    refreshAllKPIs();
    buildProgress();
    buildAdvancedInsights();
    refreshKaryawan();
    refreshAbsensi();
    buildTableLaporan();
    // Rebuild charts
    if (window.chartInstances) {
        Object.values(window.chartInstances).forEach(c => c.destroy());
    }
    initCharts();
    saveData();
}

// ============================================================
// CHARTS
// ============================================================
window.chartInstances = {};
const chartColors = { gold: '#d4a843', teal: '#2d8c6f', red: '#e74c5e', blue: '#3b82f6', purple: '#8b5cf6', pink: '#f472b6', grid: 'rgba(255,255,255,0.04)', text: '#94a3b8' };
const chartDefaults = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: chartColors.text, font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 }, padding: 14, usePointStyle: true } } },
    scales: { x: { grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }, ticks: { color: chartColors.text, font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }, ticks: { color: chartColors.text, font: { size: 10 } } } },
    animation: { duration: prefersReducedMotion ? 0 : 800, easing: 'easeOutQuart' }
};

function updateChartTheme() {
    const styles = getComputedStyle(document.documentElement);
    chartColors.text = styles.getPropertyValue('--text-secondary').trim() || '#94a3b8';
    chartColors.grid = styles.getPropertyValue('--border-color').trim() || 'rgba(255,255,255,0.04)';
    chartDefaults.plugins.legend.labels.color = chartColors.text;
    chartDefaults.scales.x.grid.color = chartColors.grid;
    chartDefaults.scales.x.ticks.color = chartColors.text;
    chartDefaults.scales.y.grid.color = chartColors.grid;
    chartDefaults.scales.y.ticks.color = chartColors.text;
}

function getCanvasForChart(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;
    if (!window.Chart) {
        const parent = canvas.parentElement;
        if (parent) parent.innerHTML = '<div class="chart-fallback"><i class="fas fa-chart-line"></i><span>Chart.js belum tersedia. Data tabel tetap dapat digunakan.</span></div>';
        return null;
    }
    return canvas;
}

function buildDailyAttendance() {
    const daily = {};
    getScopedAbsensi().forEach(record => {
        const dateKey = formatDateID(record.tgl);
        if (!dateKey) return;
        if (!daily[dateKey]) daily[dateKey] = { Hadir: 0, Izin: 0, Sakit: 0, Alpha: 0 };
        daily[dateKey][record.status] = (daily[dateKey][record.status] || 0) + 1;
    });

    const dates = Object.keys(daily)
        .sort((a, b) => (parseDateID(a)?.getTime() || 0) - (parseDateID(b)?.getTime() || 0))
        .slice(-7);

    return {
        labels: dates.map(formatShortDate),
        datasets: STATUS_LIST.map(status => ({
            label: status,
            data: dates.map(date => daily[date][status] || 0),
            backgroundColor: {
                Hadir: 'rgba(45,140,111,0.7)',
                Izin: 'rgba(212,168,67,0.7)',
                Sakit: 'rgba(59,130,246,0.7)',
                Alpha: 'rgba(231,76,94,0.7)'
            }[status],
            borderRadius: 3
        }))
    };
}

function createBar(id, labels, data, label, bgColor, borderColor) {
    const ctx = getCanvasForChart(id);
    if (!ctx) return null;
    const c = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: { labels, datasets: [{ label, data, backgroundColor: bgColor || 'rgba(212,168,67,0.7)', borderColor: borderColor || chartColors.gold, borderWidth: 1, borderRadius: 4, barPercentage: 0.6 }] },
        options: { ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }
    });
    window.chartInstances[id] = c; return c;
}

function createPie(id, labels, data, bgColors) {
    const ctx = getCanvasForChart(id);
    if (!ctx) return null;
    const c = new Chart(ctx.getContext('2d'), {
        type: 'pie',
        data: { labels, datasets: [{ data, backgroundColor: bgColors || ['#d4a843','#2d8c6f','#3b82f6','#e74c5e','#8b5cf6'], borderWidth: 0, hoverOffset: 8 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: chartColors.text, font: { size: 11 }, padding: 14, usePointStyle: true } } } }
    });
    window.chartInstances[id] = c; return c;
}

function createDoughnut(id, labels, data, bgColors) {
    const ctx = getCanvasForChart(id);
    if (!ctx) return null;
    const c = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: bgColors || ['#d4a843','#2d8c6f','#3b82f6','#e74c5e','#8b5cf6'], borderWidth: 0, hoverOffset: 8 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '55%', plugins: { legend: { position: 'bottom', labels: { color: chartColors.text, font: { size: 11 }, padding: 14, usePointStyle: true } } } }
    });
    window.chartInstances[id] = c; return c;
}

function initCharts() {
    updateChartTheme();
    const jLabels = Object.keys(jabatanCount);
    const jData = Object.values(jabatanCount);
    createBar('chartJabatan', jLabels, jData, 'Jumlah', 'rgba(212,168,67,0.7)', chartColors.gold);
    createPie('chartGender', ['Laki-laki', 'Perempuan'], [laki, perempuan], ['#3b82f6', '#f472b6']);
    createBar('chartKehadiran', ['Hadir','Izin','Sakit','Alpha'], [hadir, izin, sakit, alpha], 'Jumlah',
        ['rgba(45,140,111,0.7)','rgba(212,168,67,0.7)','rgba(59,130,246,0.7)','rgba(231,76,94,0.7)'],
        ['#2d8c6f','#d4a843','#3b82f6','#e74c5e']);
    const gjLabels = Object.keys(gajiPerJabatan);
    const gjData = Object.values(gajiPerJabatan);
    createBar('chartGajiJabatan', gjLabels, gjData, 'Total Gaji', 'rgba(45,140,111,0.7)', chartColors.teal);
    createBar('chartKeuanganJabatan', gjLabels, gjData, 'Total Gaji', 'rgba(212,168,67,0.7)', chartColors.gold);
    createPie('chartProporsiGaji', gjLabels, gjData, ['#d4a843','#2d8c6f','#3b82f6','#8b5cf6','#f472b6']);
    
    const gkNama = DATA_KARYAWAN.map(k => k.nama.split(' ')[0]);
    const gkGaji = DATA_KARYAWAN.map(k => k.gaji);
    const ctxGaji = getCanvasForChart('chartGajiKaryawan');
    if (ctxGaji) {
        const c = new Chart(ctxGaji.getContext('2d'), {
            type: 'bar',
            data: { labels: gkNama, datasets: [{ label: 'Gaji Pokok', data: gkGaji, backgroundColor: DATA_KARYAWAN.map(k => k.status === 'Aktif' ? 'rgba(45,140,111,0.7)' : 'rgba(231,76,94,0.5)'), borderColor: DATA_KARYAWAN.map(k => k.status === 'Aktif' ? '#2d8c6f' : '#e74c5e'), borderWidth: 1, borderRadius: 4, barPercentage: 0.5 }] },
            options: { ...chartDefaults, plugins: { legend: { display: false } } }
        });
        window.chartInstances['chartGajiKaryawan'] = c;
    }
    
    createBar('chartKaryawanJabatan', jLabels, jData, 'Jumlah', 'rgba(59,130,246,0.7)', '#3b82f6');
    createDoughnut('chartKaryawanGender', ['Laki-laki', 'Perempuan'], [laki, perempuan], ['#3b82f6', '#f472b6']);
    createPie('chartAbsensiPie', ['Hadir','Izin','Sakit','Alpha'], [hadir, izin, sakit, alpha], ['#2d8c6f','#d4a843','#3b82f6','#e74c5e']);
    
    const ctxHarian = getCanvasForChart('chartAbsensiHarian');
    if (ctxHarian) {
        const dailyAttendance = buildDailyAttendance();
        const c = new Chart(ctxHarian.getContext('2d'), {
            type: 'bar',
            data: {
                labels: dailyAttendance.labels,
                datasets: dailyAttendance.datasets
            },
            options: {
                ...chartDefaults,
                plugins: { legend: { position: 'top', labels: { color: chartColors.text, font: { size: 10 }, usePointStyle: true, padding: 10 } } },
                scales: { x: { stacked: true, grid: { color: chartColors.grid, drawBorder: false }, ticks: { color: chartColors.text } }, y: { stacked: true, grid: { color: chartColors.grid, drawBorder: false }, ticks: { color: chartColors.text, stepSize: 2 } } }
            }
        });
        window.chartInstances['chartAbsensiHarian'] = c;
    }
    
    const ctxOverview = getCanvasForChart('chartLaporanOverview');
    if (ctxOverview) {
        const c = new Chart(ctxOverview.getContext('2d'), {
            type: 'bar',
            data: { labels: ['Total','Aktif','Laki','Perempuan','Hadir','Izin','Sakit','Alpha'], datasets: [{ label: 'Jumlah', data: [totalKaryawan, aktif, laki, perempuan, hadir, izin, sakit, alpha], backgroundColor: ['rgba(212,168,67,0.7)','rgba(45,140,111,0.7)','rgba(59,130,246,0.7)','rgba(244,114,182,0.7)','rgba(45,140,111,0.7)','rgba(212,168,67,0.7)','rgba(59,130,246,0.7)','rgba(231,76,94,0.7)'], borderWidth: 0, borderRadius: 4 }] },
            options: { ...chartDefaults, plugins: { legend: { display: false } } }
        });
        window.chartInstances['chartLaporanOverview'] = c;
    }
    
    createDoughnut('chartLaporanStatus', ['Aktif', 'Tidak Aktif'], [aktif, tidakAktif], ['#2d8c6f', '#e74c5e']);
}

// ============================================================
// INIT
// ============================================================
function updateThemeButton() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    btn.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

function applyInitialPreferences() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    const yearFilter = document.getElementById('yearFilter');
    const savedYear = localStorage.getItem(YEAR_KEY) || DEFAULT_YEAR;
    if (yearFilter && [...yearFilter.options].some(option => option.value === savedYear)) {
        yearFilter.value = savedYear;
    }
    updateThemeButton();
}

// Initial renders
applyInitialPreferences();
recomputeMetrics();
refreshKaryawan();
refreshAbsensi();
buildTableLaporan();
initCharts();
refreshAllKPIs();
buildProgress();
buildAdvancedInsights();

// Search listeners
document.getElementById('searchKaryawan')?.addEventListener('input', () => refreshKaryawan());
document.getElementById('searchAbsensi')?.addEventListener('input', () => refreshAbsensi());

// Sort listeners
document.querySelectorAll('#tab-karyawan .sortable').forEach(th => {
    th.addEventListener('click', function() {
        const col = this.dataset.col;
        if (karyawanSortCol === col) karyawanSortDir *= -1;
        else { karyawanSortCol = col; karyawanSortDir = 1; }
        refreshKaryawan();
    });
});
document.querySelectorAll('#tab-absensi .sortable').forEach(th => {
    th.addEventListener('click', function() {
        const col = this.dataset.col;
        if (absensiSortCol === col) absensiSortDir *= -1;
        else { absensiSortCol = col; absensiSortDir = 1; }
        refreshAbsensi();
    });
});

// Tab navigation
document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('tab-' + this.dataset.tab).classList.add('active');
        requestAnimationFrame(() => Object.values(window.chartInstances || {}).forEach(chart => chart.resize?.()));
    });
});

// Theme toggle
document.getElementById('themeToggle')?.addEventListener('click', function() {
    const html = document.documentElement;
    const isLight = html.getAttribute('data-theme') === 'light';
    const nextTheme = isLight ? 'dark' : 'light';
    html.setAttribute('data-theme', nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    updateThemeButton();
    fullRefresh();
    showToast('Tema ' + (nextTheme === 'dark' ? 'gelap' : 'terang'), 'info');
});

document.getElementById('yearFilter')?.addEventListener('change', function() {
    localStorage.setItem(YEAR_KEY, this.value);
    recomputeMetrics();
    fullRefresh();
    showToast('Filter tahun: ' + (this.value === 'all' ? 'semua' : this.value), 'info');
});

// Fullscreen
document.getElementById('fullscreenToggle')?.addEventListener('click', function() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen();
    }
});
document.addEventListener('fullscreenchange', () => {
    const btn = document.getElementById('fullscreenToggle');
    if (btn) btn.innerHTML = document.fullscreenElement ? '<i class="fas fa-compress"></i>' : '<i class="fas fa-expand"></i>';
});

// Global search
const runGlobalSearch = debounce(function() {
    const q = normalizeText(document.getElementById('globalSearch')?.value || '');
    if (!q) { refreshKaryawan(); refreshAbsensi(); return; }
    let karyawan = filterKaryawan(q);
    let absensi = filterAbsensi(q);
    if (karyawanSortCol) karyawan = sortData(karyawan, karyawanSortCol, karyawanSortDir);
    if (absensiSortCol) absensi = sortData(absensi, absensiSortCol, absensiSortDir);
    renderKaryawanTable(karyawan);
    renderAbsensiTable(absensi);
}, 180);
document.getElementById('globalSearch')?.addEventListener('input', runGlobalSearch);

// Refresh
document.getElementById('refreshBtn')?.addEventListener('click', function() {
    const icon = this.querySelector('i');
    icon.classList.add('fa-spin');
    fullRefresh();
    setTimeout(() => icon.classList.remove('fa-spin'), 800);
    showToast('Data direfresh!', 'success');
});

// Alert close
document.getElementById('alertClose')?.addEventListener('click', function() {
    document.getElementById('alertBanner').classList.remove('show');
});
document.getElementById('alertBtn')?.addEventListener('click', function() {
    const banner = document.getElementById('alertBanner');
    if (!banner) return;
    if (Number(document.getElementById('alertCount')?.textContent || 0) > 0) {
        banner.classList.add('show');
        banner.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
    } else {
        showToast('Tidak ada notifikasi aktif', 'info');
    }
});

// Scroll to top
let scrollTicking = false;
window.addEventListener('scroll', function() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
        document.getElementById('scrollTop')?.classList.toggle('visible', window.scrollY > 400);
        scrollTicking = false;
    });
});
document.getElementById('scrollTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Live clock
function updateClock() {
    const now = new Date();
    const d = now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
    const t = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const el = document.getElementById('liveClock');
    if (el) el.textContent = 'Jam ' + d + ' ' + t;
}
updateClock();
setInterval(updateClock, 30000);

// Modal close on overlay click
document.getElementById('modalOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('modalOverlay')?.classList.contains('show')) closeModal();
});

// Export CSV
document.getElementById('exportBtn')?.addEventListener('click', function() {
    const rows = [['ID','Nama','Jenis Kelamin','Jabatan','Tanggal Masuk','Status','Gaji Pokok']];
    DATA_KARYAWAN.forEach(k => rows.push([k.id, k.nama, k.kelamin, k.jabatan, k.tglMasuk, k.status, k.gaji]));
    rows.push([], ['DATA ABSENSI ' + (getSelectedYear() === 'all' ? 'SEMUA TAHUN' : getSelectedYear())], ['Tanggal','ID','Nama','Jabatan','Status','Keterangan']);
    getScopedAbsensi().forEach(a => rows.push([a.tgl, a.id, a.nama, a.jabatan, a.status, a.ket]));
    rows.push([], ['LAPORAN MANAJERIAL'], ['Indikator','Nilai']);
    rows.push(['Total Karyawan', totalKaryawan], ['Karyawan Aktif', aktif], ['Total Gaji', totalGaji], ['Kehadiran', persenHadir + '%']);
    const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = '\ufeff' + rows.map(r => r.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'SIM_SDM_KedaiKopiNusantara_' + new Date().toISOString().slice(0,10) + '.csv';
    a.click(); URL.revokeObjectURL(url);
    showToast('Data diexport!', 'success');
});

// Print laporan
document.getElementById('printLaporan')?.addEventListener('click', () => window.print());

// Init toast
setTimeout(() => {
    showToast('Dashboard siap! Gunakan tombol + untuk CRUD data', 'success');
    if (totalKaryawan > 0) showToast(totalKaryawan + ' karyawan - ' + totalAbsensi + ' absensi', 'info');
}, 600);

console.log('SIM SDM Advanced Dashboard ready - Kedai Kopi Nusantara');
