import { Storage } from './storage.js';

export const BodyTracker = {
  getLogs() {
    const logs = Storage.getBodyLogs();
    // Ordena por data crescente
    return [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  addLog(entry) {
    const logs = Storage.getBodyLogs();
    const newEntry = {
      id: `body_${Date.now()}`,
      date: entry.date || new Date().toISOString().split('T')[0],
      weight: Number(parseFloat(entry.weight).toFixed(2)),
      bodyFat: entry.bodyFat ? Number(parseFloat(entry.bodyFat).toFixed(1)) : null,
      muscleMass: entry.muscleMass ? Number(parseFloat(entry.muscleMass).toFixed(1)) : null,
      notes: (entry.notes || '').trim()
    };

    // Substitui se já houver registro no mesmo dia ou adiciona
    const existingIndex = logs.findIndex(l => l.date === newEntry.date);
    if (existingIndex >= 0) {
      logs[existingIndex] = { ...logs[existingIndex], ...newEntry };
    } else {
      logs.push(newEntry);
    }

    Storage.saveBodyLogs(logs);
    return newEntry;
  },

  deleteLog(id) {
    const logs = Storage.getBodyLogs().filter(l => l.id !== id);
    Storage.saveBodyLogs(logs);
    return logs;
  },

  getStats() {
    const logs = this.getLogs();
    if (logs.length === 0) {
      return {
        hasData: false,
        currentWeight: 0,
        initialWeight: 0,
        diffWeight: 0,
        currentBf: 0,
        currentMuscle: 0,
        bmi: 0
      };
    }

    const first = logs[0];
    const latest = logs[logs.length - 1];
    const profile = Storage.getProfile();
    const heightInMeters = (profile.height || 175) / 100;
    const bmi = latest.weight > 0 ? (latest.weight / (heightInMeters * heightInMeters)).toFixed(1) : 0;

    const diffWeight = Number((latest.weight - first.weight).toFixed(1));
    const diffBf = (latest.bodyFat && first.bodyFat) ? Number((latest.bodyFat - first.bodyFat).toFixed(1)) : 0;

    return {
      hasData: true,
      currentWeight: latest.weight,
      initialWeight: first.weight,
      diffWeight,
      currentBf: latest.bodyFat,
      diffBf,
      currentMuscle: latest.muscleMass,
      latestDate: latest.date,
      bmi
    };
  },

  /**
   * Renderiza gráfico SVG vetorial dinâmico e suave para o histórico de peso
   */
  renderSvgChart(logs, metric = 'weight', width = 500, height = 220) {
    if (!logs || logs.length < 2) {
      return `
        <div class="empty-chart-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <p>Adicione pelo menos 2 pesagens para visualizar o gráfico de evolução.</p>
        </div>
      `;
    }

    const validLogs = logs.filter(l => l[metric] !== null && l[metric] !== undefined);
    if (validLogs.length < 2) {
      return `<p class="empty-state">Sem dados suficientes para ${metric}.</p>`;
    }

    const values = validLogs.map(l => l[metric]);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = (maxVal - minVal) || 1;
    const paddingX = 40;
    const paddingY = 30;

    const plotW = width - paddingX * 2;
    const plotH = height - paddingY * 2;

    const points = validLogs.map((log, index) => {
      const x = paddingX + (index / (validLogs.length - 1)) * plotW;
      const y = height - paddingY - ((log[metric] - minVal) / range) * plotH;
      return { x, y, val: log[metric], date: log.date };
    });

    // Cria caminho em curva suave SVG
    const linePath = points.reduce((acc, p, i, a) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = a[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
    }, "");

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    const dots = points.map(p => `
      <circle cx="${p.x}" cy="${p.y}" r="4.5" class="chart-dot" />
      <text x="${p.x}" y="${p.y - 10}" text-anchor="middle" class="chart-label">${p.val}${metric === 'weight' ? 'kg' : '%'}</text>
    `).join('');

    const dateLabels = points.map((p, idx) => {
      if (validLogs.length > 5 && idx % 2 !== 0 && idx !== validLogs.length - 1) return '';
      const parts = p.date.split('-');
      const formatted = `${parts[2]}/${parts[1]}`;
      return `<text x="${p.x}" y="${height - 8}" text-anchor="middle" class="chart-axis-date">${formatted}</text>`;
    }).join('');

    return `
      <svg viewBox="0 0 ${width} ${height}" class="bio-evolution-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#00e676" stop-opacity="0.38"/>
            <stop offset="100%" stop-color="#00e676" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <!-- Linhas guias horizontais -->
        <line x1="${paddingX}" y1="${paddingY}" x2="${width - paddingX}" y2="${paddingY}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4" />
        <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" stroke="rgba(255,255,255,0.15)" />

        <!-- Área sombreada e linha de tendência -->
        <path d="${areaPath}" fill="url(#chartGradient)" />
        <path d="${linePath}" fill="none" stroke="#00e676" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Pontos e legendas -->
        ${dots}
        ${dateLabels}
      </svg>
    `;
  }
};
