import { useEffect, useState } from 'react'
import DeviceCard from '../../components/DeviceCard'
import MetricChart from '../../components/MetricChart'
import { api } from '../../services/apiClient'


const metricList = [
    {
        id: 'temperature',
        title: 'Nhiệt độ',
        unit: '°C',
        value: 27.4,
        values: [26.5, 27.1, 26.8, 27.9, 27.4, 28.1, 27.4],
        accent: '#fb7185',
    },
    {
        id: 'humidity',
        title: 'Độ ẩm',
        unit: '%',
        value: 61,
        values: [58, 59, 60, 62, 63, 62, 61],
        accent: '#38bdf8',
    },
]

const normalizeDevices = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.devices)) return payload.devices
    return []
}

function Dashboard() {
    const [devices, setDevices] = useState([])
    const [pending, setPending] = useState({})
    const [loadingDevices, setLoadingDevices] = useState(true)
    const [deviceError, setDeviceError] = useState('')

    useEffect(() => {
        let isMounted = true

        const fetchDevices = async () => {
            try {
                const payload = await api.get('/device/')
                if (!isMounted) return
                const nextDevices = normalizeDevices(payload)
                setDevices(nextDevices)
                setDeviceError(nextDevices.length ? '' : 'Không có thiết bị nào để hiển thị.')
            } catch (error) {
                if (!isMounted) return
                console.error('Failed to get devices', error)
                setDeviceError('Không tải được danh sách thiết bị. Vui lòng thử lại.')
            } finally {
                if (isMounted) {
                    setLoadingDevices(false)
                }
            }
        }

        fetchDevices()
        return () => {
            isMounted = false
        }
    }, [])

    const toggleDevice = async (id) => {
        const snapshot = devices.map((device) => ({ ...device }))
        const currentDevice = devices.find((device) => device.id === id)

        if (!currentDevice) {
            return
        }

        const nextStatus = currentDevice.status === 'on' ? 'off' : 'on'

        setPending((prev) => ({ ...prev, [id]: true }))
        setDevices((prev) =>
            prev.map((device) => (device.id === id ? { ...device, status: nextStatus } : device))
        )

        try {
            await api.post(`/device/${id}/${nextStatus}/dashboard`)
        } catch (error) {
            console.error('Failed to toggle device', error)
            setDevices(snapshot)
        } finally {
            setPending((prev) => ({ ...prev, [id]: false }))
        }
    }

    return (
        <main className="dashboard">
            <header className="dashboard__header">
                <div>
                    <p className="dashboard__eyebrow">Tình trạng thiết bị</p>
                    <h1>Bảng điều khiển IoT</h1>
                    <p className="dashboard__subtitle">
                        Bật/tắt quạt và đèn theo thời gian thực ngay tại đây.
                    </p>
                </div>
            </header>

            {deviceError && <div className="alert alert--error">{deviceError}</div>}
            {loadingDevices && <p className="dashboard__subtitle">Đang tải thiết bị...</p>}

            <section className="dashboard__grid">
                {devices.length > 0 ? (
                    devices.map(({ id, name, status }) => (
                        <DeviceCard
                            key={id}
                            label={name}
                            isOn={status === 'on'}
                            onToggle={() => toggleDevice(id)}
                            loading={!!pending[id]}
                        />
                    ))
                ) : (
                    !loadingDevices && (
                        <p className="dashboard__subtitle">Chưa có thiết bị nào trong hệ thống.</p>
                    )
                )}
            </section>

            <section className="metrics">
                <header className="metrics__header">
                    <div>
                        <p className="dashboard__eyebrow">Môi trường</p>
                        <h2>Biểu đồ nhiệt độ & độ ẩm</h2>
                        <p className="dashboard__subtitle">
                            Dữ liệu được cập nhật mới nhất trong một giờ qua.
                        </p>
                    </div>
                </header>
                <div className="metrics__grid">
                    {metricList.map((metric) => (
                        <MetricChart key={metric.id} {...metric} />
                    ))}
                </div>
            </section>
        </main>
    )
}

export default Dashboard;