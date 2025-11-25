const historyData = [
    {
        action_type: 'off',
        action_value: null,
        triggered_by: 'voice',
        id: 1,
        device_id: 1,
        created_at: '2025-11-25T08:08:38',
    },
    {
        action_type: 'on',
        action_value: '60%',
        triggered_by: 'app',
        id: 2,
        device_id: 2,
        created_at: '2025-11-25T08:02:11',
    },
    {
        action_type: 'on',
        action_value: '24°C',
        triggered_by: 'automation',
        id: 3,
        device_id: 3,
        created_at: '2025-11-25T07:55:02',
    },
    {
        action_type: 'off',
        action_value: null,
        triggered_by: 'schedule',
        id: 4,
        device_id: 1,
        created_at: '2025-11-25T07:30:45',
    },
]

const formatDateTime = (isoString) =>
    new Date(isoString).toLocaleString('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
    })

function History() {
    return (
        <main className="history">
            <header className="history__header">
                <div>
                    <p className="dashboard__eyebrow">Nhật ký thiết bị</p>
                    <h1>Lịch sử hành động</h1>
                    <p className="dashboard__subtitle">
                        Ghi lại mọi sự kiện bật/tắt cùng nguồn kích hoạt.
                    </p>
                </div>
                <button className="history__export">Xuất CSV</button>
            </header>

            <section className="history__table-wrapper">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Thiết bị</th>
                            <th>Hành động</th>
                            <th>Giá trị</th>
                            <th>Kích hoạt bởi</th>
                            <th>Thời gian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyData.map((entry) => (
                            <tr key={entry.id}>
                                <td>#{entry.id}</td>
                                <td>#{entry.device_id}</td>
                                <td>
                                    <span className={`chip chip--${entry.action_type}`}>
                                        {entry.action_type === 'on' ? 'Bật' : 'Tắt'}
                                    </span>
                                </td>
                                <td>{entry.action_value ?? '—'}</td>
                                <td>
                                    <span className={`pill pill--${entry.triggered_by}`}>
                                        {entry.triggered_by}
                                    </span>
                                </td>
                                <td>{formatDateTime(entry.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </main>
    )
}

export default History;