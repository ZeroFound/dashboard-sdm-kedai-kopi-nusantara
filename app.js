// ============================================================
// APP.JS — SIM SDM Advanced Dashboard
// Fitur: CRUD Karyawan, CRUD Absensi, localStorage, Smart Alerts,
//        Detail Modal, Export PDF via print, Real-time Notifications
// ============================================================

// ============================================================
// DATA STORE (with localStorage persistence)
// ============================================================
const STORAGE_KEY = 'sim_sdm_kopi_data';

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
let DATA_KARYAWAN = savedData ? savedData.karyawan : [...DEFAULT_KARYAWAN];
let DATA_ABSENSI = savedData ? savedData.absensi : [...DEFAULT_ABSENSI];

// ============================================================
// COMPUTED METRICS
// ============================================================
let totalKaryawan, aktif, tidakAktif, totalGaji, rataGaji, gajiTertinggi, gajiTerendah;
let laki, perempuan, jabatanCount, hadir, izin, sakit, alpha, totalAbsensi, persenHadir, gajiPerJabatan;

function recomputeMetrics() {
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
    hadir = DATA_ABSENSI.filter(a => a.status === 'Hadir').length;
    izin = DATA_ABSENSI.filter(a => a.status === 'Izin').length;
    sakit = DATA_ABSENSI.filter(a => a.status === 'Sakit').length;
    alpha = DATA_ABSENSI.filter(a => a.status === 'Alpha').length;
    totalAbsensi = hadir + izin + sakit + alpha;
    persenHadir = totalAbsensi > 0 ? ((hadir / totalAbsensi) * 100).toFixed(1) : 0;
    gajiPerJabatan = {};
    DATA_KARYAWAN.forEach(k => {
        if (k.status === 'Aktif') { gajiPerJabatan[k.jabatan] = (gajiPerJabatan[k.jabatan] || 0) + k.gaji; }
    });
}

recomputeMetrics();

function formatRupiah(n) {
    return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// ============================================================
// TOAST SYSTEM
// ============================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    const icons = { success: 'fa-circle-check', warning: 'fa-triangle-exclamation', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    t.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i> ${message}`;
    container.appendChild(t);
    setTimeout(() => { t.classList.add('fade-out'); setTimeout(() => t.remove(), 300); }, 3000);
}

// ============================================================
// ANIMATED COUNTER
// ============================================================
function animateCounter(el, target, suffix = '', duration = 1200) {
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
    for (let i = 0; i < 20; i++) {
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
    
    // Check for Alpha status employees
    const alphaRecords = DATA_ABSENSI.filter(a => a.status === 'Alpha');
    const alphaNames = [...new Set(alphaRecords.map(a => a.nama))];
    const inactiveCount = DATA_KARYAWAN.filter(k => k.status !== 'Aktif').length;
    
    let alerts = [];
    if (alphaNames.length > 0) alerts.push(`${alphaRecords.length} catatan Alpha (${alphaNames.join(', ')})`);
    if (inactiveCount > 0) alerts.push(`${inactiveCount} karyawan tidak aktif`);
    if (parseFloat(persenHadir) < 75) alerts.push(`Kehadiran ${persenHadir}% (target >75%)`);
    
    if (alerts.length > 0) {
        banner.classList.add('show');
        text.innerHTML = `<strong>${alerts.length} perhatian:</strong> ${alerts.join(' · ')}`;
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

// ============================================================
// TABLE RENDERERS
// ============================================================
let karyawanSortCol = null, karyawanSortDir = 1;
let absensiSortCol = null, absensiSortDir = 1;

function renderKaryawanTable(data) {
    const tbody = document.getElementById('tableKaryawan');
    if (!tbody) return;
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="table-empty"><i class="fas fa-search"></i> Tidak ada data</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(k => `
        <tr class="clickable" data-id="${k.id}">
            <td><strong style="color:var(--secondary)">${k.id}</strong></td>
            <td><strong>${k.nama}</strong></td>
            <td class="${k.kelamin === 'Laki-laki' ? 'gender-male' : 'gender-female'}"><i class="fas fa-${k.kelamin === 'Laki-laki' ? 'mars' : 'venus'}"></i> ${k.kelamin}</td>
            <td>${k.jabatan}</td>
            <td>${k.tglMasuk}</td>
            <td><span class="status-badge ${k.status === 'Aktif' ? 'status-hadir' : 'status-inactive'}">${k.status}</span></td>
            <td><strong>${formatRupiah(k.gaji)}</strong></td>
            <td>
                <div class="table-actions">
                    <button class="action-btn view" data-id="${k.id}" title="Lihat Detail"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit" data-id="${k.id}" title="Edit"><i class="fas fa-pen"></i></button>
                    <button class="action-btn delete" data-id="${k.id}" title="Hapus"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
    document.getElementById('karyawanCount').textContent = data.length;
    
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
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="table-empty"><i class="fas fa-search"></i> Tidak ada data</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(a => `
        <tr>
            <td>${a.tgl}</td>
            <td style="color:var(--secondary)">${a.id}</td>
            <td>${a.nama}</td>
            <td>${a.jabatan}</td>
            <td><span class="status-badge status-${a.status.toLowerCase()}">${a.status}</span></td>
            <td>${a.ket}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn edit abs-edit" data-idx="${data.indexOf(a)}" title="Edit"><i class="fas fa-pen"></i></button>
                    <button class="action-btn delete abs-delete" data-idx="${data.indexOf(a)}" title="Hapus"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
    document.getElementById('absensiCount').textContent = data.length;
}

// Search & Sort
function filterKaryawan(query) {
    const q = query.toLowerCase();
    return DATA_KARYAWAN.filter(k =>
        k.id.toLowerCase().includes(q) || k.nama.toLowerCase().includes(q) ||
        k.jabatan.toLowerCase().includes(q) || k.kelamin.toLowerCase().includes(q) ||
        k.status.toLowerCase().includes(q) || k.gaji.toString().includes(q)
    );
}

function filterAbsensi(query) {
    const q = query.toLowerCase();
    return DATA_ABSENSI.filter(a =>
        a.id.toLowerCase().includes(q) || a.nama.toLowerCase().includes(q) ||
        a.jabatan.toLowerCase().includes(q) || a.status.toLowerCase().includes(q) ||
        a.tgl.includes(q) || a.ket.toLowerCase().includes(q)
    );
}

function sortData(data, col, dir) {
    return [...data].sort((a, b) => {
        let va = a[col], vb = b[col];
        if (col === 'gaji') { va = Number(va); vb = Number(vb); }
        if (col === 'tglMasuk' || col === 'tgl') return dir * (new Date(va) - new Date(vb));
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
    });
}

function refreshKaryawan() {
    const q = document.getElementById('searchKaryawan')?.value || '';
    let data = filterKaryawan(q);
    if (karyawanSortCol) data = sortData(data, karyawanSortCol, karyawanSortDir);
    renderKaryawanTable(data);
}

function refreshAbsensi() {
    const q = document.getElementById('searchAbsensi')?.value || '';
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
    const rows = [
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
    tbody.innerHTML = rows.map(r => `<tr><td style="font-weight:600;color:var(--text-primary)">${r[0]}</td><td><strong>${r[1]}</strong></td><td>${r[2]}</td></tr>`).join('');
    
    const kesimpulan = document.getElementById('laporanKesimpulan');
    if (kesimpulan) {
        kesimpulan.innerHTML = `
            <li><span class="num">1</span> Total <strong>${totalKaryawan}</strong> karyawan, <strong>${aktif}</strong> aktif, <strong>${tidakAktif}</strong> tidak aktif.</li>
            <li><span class="num">2</span> Komposisi: <strong>${laki}</strong> laki-laki, <strong>${perempuan}</strong> perempuan.</li>
            <li><span class="num">3</span> Kehadiran: <strong>${persenHadir}%</strong> — ${parseFloat(persenHadir) >= 70 ? 'cukup baik' : 'perlu ditingkatkan'}.</li>
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
    overlay.classList.add('show');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalFooter').innerHTML = footerHtml || '';
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
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
                    <option value="Kasir">Kasir</option>
                    <option value="Barista">Barista</option>
                    <option value="Koki">Koki</option>
                    <option value="Admin">Admin</option>
                    <option value="Pelayan">Pelayan</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Tanggal Masuk</label>
                <input type="text" id="formTgl" placeholder="DD/MM/YYYY" value="${new Date().toLocaleDateString('id-ID')}">
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
                <input type="text" value="${k.id}" readonly style="opacity:0.6">
                <input type="hidden" id="formEditId" value="${k.id}">
            </div>
            <div class="form-group">
                <label>Nama</label>
                <input type="text" id="formNama" value="${k.nama}">
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
                    ${['Kasir','Barista','Koki','Admin','Pelayan'].map(j => `<option value="${j}" ${k.jabatan===j?'selected':''}>${j}</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Tanggal Masuk</label>
                <input type="text" id="formTgl" value="${k.tglMasuk}">
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
    const nama = document.getElementById('formNama').value.trim();
    const gaji = parseInt(document.getElementById('formGaji').value);
    
    if (!nama) { document.getElementById('formNama').parentElement.classList.add('error'); return; }
    if (!gaji || gaji < 1000000) { document.getElementById('formGaji').parentElement.classList.add('error'); return; }
    
    DATA_KARYAWAN.push({
        id: document.getElementById('formId').value,
        nama: nama,
        kelamin: document.getElementById('formKelamin').value,
        jabatan: document.getElementById('formJabatan').value,
        tglMasuk: document.getElementById('formTgl').value,
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
    const id = document.getElementById('formEditId').value;
    const idx = DATA_KARYAWAN.findIndex(k => k.id === id);
    if (idx === -1) return;
    
    const nama = document.getElementById('formNama').value.trim();
    const gaji = parseInt(document.getElementById('formGaji').value);
    if (!nama) return;
    
    DATA_KARYAWAN[idx] = {
        ...DATA_KARYAWAN[idx],
        nama: nama,
        kelamin: document.getElementById('formKelamin').value,
        jabatan: document.getElementById('formJabatan').value,
        tglMasuk: document.getElementById('formTgl').value,
        status: document.getElementById('formStatus').value,
        gaji: gaji || DATA_KARYAWAN[idx].gaji
    };
    saveData();
    closeModal();
    fullRefresh();
    showToast('Karyawan berhasil diupdate!', 'success');
};

// Delete employee
window.deleteEmployee = function(id) {
    if (!confirm('Hapus karyawan ' + id + '?')) return;
    DATA_KARYAWAN = DATA_KARYAWAN.filter(k => k.id !== id);
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
    const absenCount = DATA_ABSENSI.filter(a => a.id === id).length;
    const absenHadir = DATA_ABSENSI.filter(a => a.id === id && a.status === 'Hadir').length;
    
    openModal('Detail Karyawan', `
        <div class="detail-avatar">${k.nama.charAt(0)}</div>
        <div class="detail-name">${k.nama}</div>
        <div class="detail-role">${k.jabatan} · ${k.id}</div>
        <div class="detail-grid">
            <div class="detail-item"><div class="detail-label">Status</div><div class="detail-value"><span class="status-badge ${k.status === 'Aktif' ? 'status-hadir' : 'status-inactive'}">${k.status}</span></div></div>
            <div class="detail-item"><div class="detail-label">Jenis Kelamin</div><div class="detail-value">${k.kelamin}</div></div>
            <div class="detail-item"><div class="detail-label">Tanggal Masuk</div><div class="detail-value">${k.tglMasuk}</div></div>
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
    const today = new Date().toLocaleDateString('id-ID');
    const karyawanOpts = DATA_KARYAWAN.filter(k => k.status === 'Aktif').map(k =>
        `<option value="${k.id}">${k.id} - ${k.nama} (${k.jabatan})</option>`
    ).join('');
    
    openModal('Tambah Absensi', `
        <div class="form-row">
            <div class="form-group">
                <label>Tanggal</label>
                <input type="text" id="absTgl" value="${today}">
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
                    <option value="Hadir">Hadir</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Alpha">Alpha</option>
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
    const karyawanId = document.getElementById('absKaryawan').value;
    const k = DATA_KARYAWAN.find(x => x.id === karyawanId);
    if (!k) return;
    
    DATA_ABSENSI.push({
        tgl: document.getElementById('absTgl').value,
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

// ============================================================
// RESET DATA
// ============================================================
function resetData() {
    if (!confirm('Reset semua data ke awal? Data custom akan hilang.')) return;
    DATA_KARYAWAN = [...DEFAULT_KARYAWAN];
    DATA_ABSENSI = [...DEFAULT_ABSENSI];
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
    animation: { duration: 800, easing: 'easeOutQuart' }
};

function createBar(id, labels, data, label, bgColor, borderColor) {
    const ctx = document.getElementById(id);
    if (!ctx) return null;
    const c = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: { labels, datasets: [{ label, data, backgroundColor: bgColor || 'rgba(212,168,67,0.7)', borderColor: borderColor || chartColors.gold, borderWidth: 1, borderRadius: 4, barPercentage: 0.6 }] },
        options: { ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }
    });
    window.chartInstances[id] = c; return c;
}

function createPie(id, labels, data, bgColors) {
    const ctx = document.getElementById(id);
    if (!ctx) return null;
    const c = new Chart(ctx.getContext('2d'), {
        type: 'pie',
        data: { labels, datasets: [{ data, backgroundColor: bgColors || ['#d4a843','#2d8c6f','#3b82f6','#e74c5e','#8b5cf6'], borderWidth: 0, hoverOffset: 8 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: chartColors.text, font: { size: 11 }, padding: 14, usePointStyle: true } } } }
    });
    window.chartInstances[id] = c; return c;
}

function createDoughnut(id, labels, data, bgColors) {
    const ctx = document.getElementById(id);
    if (!ctx) return null;
    const c = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: bgColors || ['#d4a843','#2d8c6f','#3b82f6','#e74c5e','#8b5cf6'], borderWidth: 0, hoverOffset: 8 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '55%', plugins: { legend: { position: 'bottom', labels: { color: chartColors.text, font: { size: 11 }, padding: 14, usePointStyle: true } } } }
    });
    window.chartInstances[id] = c; return c;
}

function initCharts() {
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
    const ctxGaji = document.getElementById('chartGajiKaryawan');
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
    
    const ctxHarian = document.getElementById('chartAbsensiHarian');
    if (ctxHarian) {
        const c = new Chart(ctxHarian.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['01 Juni', '02 Juni', '03 Juni'],
                datasets: [
                    { label: 'Hadir', data: [7,8,7], backgroundColor: 'rgba(45,140,111,0.7)', borderRadius: 3 },
                    { label: 'Izin', data: [2,0,1], backgroundColor: 'rgba(212,168,67,0.7)', borderRadius: 3 },
                    { label: 'Sakit', data: [1,1,1], backgroundColor: 'rgba(59,130,246,0.7)', borderRadius: 3 },
                    { label: 'Alpha', data: [1,1,0], backgroundColor: 'rgba(231,76,94,0.7)', borderRadius: 3 }
                ]
            },
            options: {
                ...chartDefaults,
                plugins: { legend: { position: 'top', labels: { color: chartColors.text, font: { size: 10 }, usePointStyle: true, padding: 10 } } },
                scales: { x: { stacked: true, grid: { color: chartColors.grid, drawBorder: false }, ticks: { color: chartColors.text } }, y: { stacked: true, grid: { color: chartColors.grid, drawBorder: false }, ticks: { color: chartColors.text, stepSize: 2 } } }
            }
        });
        window.chartInstances['chartAbsensiHarian'] = c;
    }
    
    const ctxOverview = document.getElementById('chartLaporanOverview');
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
// Initial renders
renderKaryawanTable(DATA_KARYAWAN);
renderAbsensiTable(DATA_ABSENSI);
buildTableLaporan();
initCharts();
refreshAllKPIs();
buildProgress();

// Search listeners
document.getElementById('searchKaryawan')?.addEventListener('input', refreshKaryawan);
document.getElementById('searchAbsensi')?.addEventListener('input', refreshAbsensi);

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
    });
});

// Theme toggle
document.getElementById('themeToggle')?.addEventListener('click', function() {
    const html = document.documentElement;
    const isLight = html.getAttribute('data-theme') === 'light';
    html.setAttribute('data-theme', isLight ? 'dark' : 'light');
    this.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    showToast('Tema ' + (isLight ? 'gelap' : 'terang'), 'info');
});

// Fullscreen
document.getElementById('fullscreenToggle')?.addEventListener('click', function() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        this.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        document.exitFullscreen();
        this.innerHTML = '<i class="fas fa-expand"></i>';
    }
});

// Global search
document.getElementById('globalSearch')?.addEventListener('input', function() {
    const q = this.value.toLowerCase().trim();
    if (!q) { refreshKaryawan(); refreshAbsensi(); return; }
    renderKaryawanTable(filterKaryawan(q));
    renderAbsensiTable(filterAbsensi(q));
    const total = filterKaryawan(q).length + filterAbsensi(q).length;
    if (total > 0) showToast(`Ditemukan ${total} hasil`, 'info');
});

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

// Scroll to top
window.addEventListener('scroll', function() {
    document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 400);
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
    if (el) el.textContent = '⏱️ ' + d + ' ' + t;
}
updateClock();
setInterval(updateClock, 30000);

// Modal close on overlay click
document.getElementById('modalOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// Export CSV
document.getElementById('exportBtn')?.addEventListener('click', function() {
    const rows = [['ID','Nama','Jenis Kelamin','Jabatan','Tanggal Masuk','Status','Gaji Pokok']];
    DATA_KARYAWAN.forEach(k => rows.push([k.id, k.nama, k.kelamin, k.jabatan, k.tglMasuk, k.status, k.gaji]));
    rows.push([], ['LAPORAN MANAJERIAL'], ['Indikator','Nilai']);
    rows.push(['Total Karyawan', totalKaryawan], ['Karyawan Aktif', aktif], ['Total Gaji', totalGaji], ['Kehadiran', persenHadir + '%']);
    const csv = rows.map(r => r.join(',')).join('\n');
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
    if (totalKaryawan > 0) showToast(totalKaryawan + ' karyawan · ' + totalAbsensi + ' absensi', 'info');
}, 600);

console.log('✅ SIM SDM Advanced Dashboard with CRUD - Kedai Kopi Nusantara');