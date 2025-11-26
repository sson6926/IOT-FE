import { useEffect, useMemo, useState } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { api } from '../../services/apiClient'

const normalizeSensorData = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    return []
}

const formatDateTime = (isoString) =>
    isoString
        ? new Date(isoString).toLocaleString('vi-VN', {
              dateStyle: 'short',
              timeStyle: 'medium',
          })
        : '--'

const buildSeriesPoints = (data = [], key) =>
    data.map((item) => [new Date(item.created_at).getTime(), item[key]])

const buildDelta = (current, previous, precision = 1) => {
    if (current == null || previous == null) return null
    const diff = Number((current - previous).toFixed(precision))
    if (Number.isNaN(diff)) return null
    return diff
}

function Sensor() {
    const [sensorData, setSensorData] = useState([])
    const [sensorError, setSensorError] = useState('')
    const [sensorLoading, setSensorLoading] = useState(true)

    useEffect(() => {
        let isMounted = true
        let timerId

        const fetchSensorData = async () => {
            try {
                const payload = await api.get('/sensordata/latest/100')
                if (!isMounted) return
                const normalized = normalizeSensorData(payload)
                const sorted = normalized
                    .slice()
                    .sort(
                        (a, b) =>
                            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    )
                setSensorData(sorted.slice(-100))
                setSensorError('')
            } catch (error) {
                if (!isMounted) return
                console.error('Failed to fetch sensor data', error)
                setSensorError('Không tải được dữ liệu cảm biến, đang dùng dữ liệu trước đó.')
            } finally {
                if (isMounted) {
                    setSensorLoading(false)
                    timerId = setTimeout(fetchSensorData, 5000)
                }
            }
        }

        fetchSensorData()

        return () => {
            isMounted = false
            if (timerId) {
                clearTimeout(timerId)
            }
        }
    }, [])

    const latestSensor = sensorData.at(-1)
    const temperatureSeries = useMemo(
        () => buildSeriesPoints(sensorData, 'temperature'),
        [sensorData]
    )
    const humiditySeries = useMemo(
        () => buildSeriesPoints(sensorData, 'humidity'),
        [sensorData]
    )

    const deltas = useMemo(() => {
        if (sensorData.length < 2) return {}
        const latest = sensorData.at(-1)
        const previous = sensorData.at(-2)
        return {
            temperature: buildDelta(latest?.temperature, previous?.temperature),
            humidity: buildDelta(latest?.humidity, previous?.humidity),
            timestamp: previous?.created_at,
        }
    }, [sensorData])

    const temperatureChartOptions = useMemo(
        () => ({
            chart: {
                type: 'spline',
                height: 260,
                backgroundColor: 'transparent',
                spacing: [10, 10, 10, 10],
            },
            title: { text: undefined },
            xAxis: {
                type: 'datetime',
                lineColor: '#e2e8f0',
                tickColor: '#e2e8f0',
                labels: { style: { color: '#94a3b8' } },
            },
            yAxis: {
                title: { text: '°C', style: { color: '#94a3b8' } },
                gridLineColor: '#f1f5f9',
                labels: { style: { color: '#94a3b8' } },
            },
            tooltip: {
                xDateFormat: 'HH:mm:ss - dd/MM',
                valueSuffix: ' °C',
                backgroundColor: '#0f172a',
                style: { color: '#fff' },
            },
            legend: { enabled: false },
            credits: { enabled: false },
            time: { useUTC: false },
            series: [
                {
                    name: 'Nhiệt độ',
                    data: temperatureSeries,
                    color: '#fb7185',
                    marker: { enabled: false },
                },
            ],
            responsive: {
                rules: [
                    {
                        condition: { maxWidth: 768 },
                        chartOptions: {
                            chart: { height: 220, spacing: [10, 5, 10, 5] },
                            xAxis: { labels: { style: { fontSize: '10px' } } },
                            yAxis: { labels: { style: { fontSize: '10px' } } },
                        },
                    },
                ],
            },
        }),
        [temperatureSeries]
    )

    const humidityChartOptions = useMemo(
        () => ({
            chart: {
                type: 'spline',
                height: 260,
                backgroundColor: 'transparent',
                spacing: [10, 10, 10, 10],
            },
            title: { text: undefined },
            xAxis: {
                type: 'datetime',
                lineColor: '#e2e8f0',
                tickColor: '#e2e8f0',
                labels: { style: { color: '#94a3b8' } },
            },
            yAxis: {
                title: { text: '%', style: { color: '#94a3b8' } },
                gridLineColor: '#f1f5f9',
                labels: { style: { color: '#94a3b8' } },
            },
            tooltip: {
                xDateFormat: 'HH:mm:ss - dd/MM',
                valueSuffix: ' %',
                backgroundColor: '#0f172a',
                style: { color: '#fff' },
            },
            legend: { enabled: false },
            credits: { enabled: false },
            time: { useUTC: false },
            series: [
                {
                    name: 'Độ ẩm',
                    data: humiditySeries,
                    color: '#38bdf8',
                    marker: { enabled: false },
                },
            ],
            responsive: {
                rules: [
                    {
                        condition: { maxWidth: 768 },
                        chartOptions: {
                            chart: { height: 220, spacing: [10, 5, 10, 5] },
                            xAxis: { labels: { style: { fontSize: '10px' } } },
                            yAxis: { labels: { style: { fontSize: '10px' } } },
                        },
                    },
                ],
            },
        }),
        [humiditySeries]
    )

    return (
        <main className="dashboard sensor-page">
            <header className="dashboard__header">
                <div>
                    <h1>Dữ liệu cảm biến</h1>
                    <p className="dashboard__subtitle">
                        Nhiệt độ & độ ẩm từ cảm biến, cập nhật tự động mỗi 5 giây.
                    </p>
                </div>
            </header>

            {sensorError && <div className="alert alert--error">{sensorError}</div>}
            {sensorLoading && (
                <p className="dashboard__subtitle">Đang tải dữ liệu cảm biến...</p>
            )}

            <section className="realtime">
                <header className="metrics__header">
                    <div>
                        <h2>Giá trị hiện tại</h2>
                        <p className="dashboard__subtitle">
                            Lần cập nhật cuối:{' '}
                            <strong>{formatDateTime(latestSensor?.created_at)}</strong>
                        </p>
                    </div>
                </header>

                <div className="realtime__cards">
                    {[
                        {
                            id: 'temperature',
                            label: 'Nhiệt độ',
                            value: latestSensor?.temperature,
                            unit: '°C',
                            gradient: 'linear-gradient(135deg, #fb7185, #f97316)',
                        },
                        {
                            id: 'humidity',
                            label: 'Độ ẩm',
                            value: latestSensor?.humidity,
                            unit: '%',
                            gradient: 'linear-gradient(135deg, #51a687, #06402b)',
                        },
                    ].map(({ id, label, value, unit, gradient }) => {
                        const delta = deltas[id]
                        const deltaDirection =
                            delta == null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
                        return (
                            <article
                                key={id}
                                className={`realtime-card realtime-card--${id}`}
                                style={{ background: gradient }}
                            >
                                <p className="realtime-card__label">{label}</p>
                                <p className="realtime-card__value">
                                    {value ?? '--'}
                                    <span>{unit}</span>
                                </p>
                                <p className={`realtime-card__delta realtime-card__delta--${deltaDirection}`}>
                                    {delta == null ? 'Không đổi' : (
                                        <>
                                            {deltaDirection === 'up'
                                                ? '▲'
                                                : deltaDirection === 'down'
                                                    ? '▼'
                                                    : '▬'}{' '}
                                            <strong>{`${delta > 0 ? '+' : ''}${delta}${unit}`}</strong>
                                            {deltas.timestamp
                                                ? ` so với ${new Date(
                                                    deltas.timestamp
                                                ).toLocaleTimeString('vi-VN')}`
                                                : ''}
                                        </>
                                    )}
                                </p>
                                <p className="realtime-card__timestamp">
                                    {formatDateTime(latestSensor?.created_at)}
                                </p>
                                <div className="realtime-card__progress">
                                    <div
                                        className="realtime-card__progress-fill"
                                        style={{
                                            width:
                                                id === 'temperature'
                                                    ? `${Math.min((value ?? 0) / 40 * 100, 100)}%`
                                                    : `${Math.min((value ?? 0), 100)}%`,
                                        }}
                                    />
                                </div>
                            </article>
                        )
                    })}
                </div>

                {sensorData.length > 0 && (
                    <div className="realtime__grid">
                        <article className="sensor-chart sensor-chart--wide">
                            <header>
                                <div>
                                    <p className="chart-card__eyebrow">10 bản ghi gần nhất</p>
                                    <h3>Diễn biến nhiệt độ</h3>
                                </div>
                                <p className="chart-card__value">
                                    {latestSensor?.temperature ?? '--'}
                                    <span>°C</span>
                                </p>
                            </header>
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={temperatureChartOptions}
                            />
                        </article>

                        <article className="sensor-chart sensor-chart--wide">
                            <header>
                                <div>
                                    <p className="chart-card__eyebrow">10 bản ghi gần nhất</p>
                                    <h3>Diễn biến độ ẩm</h3>
                                </div>
                                <p className="chart-card__value">
                                    {latestSensor?.humidity ?? '--'}
                                    <span>%</span>
                                </p>
                            </header>
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={humidityChartOptions}
                            />
                        </article>

                        <div className="sensor-log">
                            <div className="sensor-log__header">
                                <p className="chart-card__eyebrow">Lịch sử tức thời</p>
                                <h3>Chi tiết bản ghi</h3>
                            </div>
                            <div className="sensor-log__list">
                                <ul>
                                    {sensorData
                                        .slice()
                                        .reverse()
                                        .map((item) => (
                                            <li key={item.id}>
                                                <div>
                                                    <p className="sensor-log__time">
                                                        {formatDateTime(item.created_at)}
                                                    </p>
                                                    <p className="sensor-log__sub">ID: {item.id}</p>
                                                </div>
                                                <div className="sensor-log__values">
                                                    <span className="chip chip--temperature">
                                                        {item.temperature}°C
                                                    </span>
                                                    <span className="chip chip--humidity">
                                                        {item.humidity}%
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </main>
    )
}

export default Sensor


