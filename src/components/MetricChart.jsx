function normalizePoints(values) {
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1

    return values
        .map((value, index) => {
            const x = (index / (values.length - 1 || 1)) * 100
            const y = 100 - ((value - min) / range) * 100
            return `${x},${y}`
        })
        .join(' ')
}

function MetricChart({ id, title, unit, value, values, accent }) {
    return (
        <article className="chart-card">
            <header className="chart-card__header">
                <div>
                    <p className="chart-card__eyebrow">Chỉ số môi trường</p>
                    <h3>{title}</h3>
                </div>
                <p className="chart-card__value">
                    {value}
                    <span>{unit}</span>
                </p>
            </header>

            <svg className="chart-card__sparkline" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <linearGradient id={`spark-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
                        <stop offset="100%" stopColor={accent} stopOpacity="0" />
                    </linearGradient>
                </defs>

                <polyline
                    fill="none"
                    stroke={accent}
                    strokeWidth="2"
                    points={normalizePoints(values)}
                />
                <polygon fill={`url(#spark-${id})`} points={`${normalizePoints(values)} 100,100 0,100`} />
            </svg>

            <footer className="chart-card__footer">
                <p>So với giờ trước</p>
                <span className="chart-card__trend" style={{ color: accent }}>
                    {values.at(-1) - values[values.length - 2] >= 0 ? '▲' : '▼'} {Math.abs(values.at(-1) - values[values.length - 2]).toFixed(1)}
                    {unit}
                </span>
            </footer>
        </article>
    )
}

export default MetricChart

