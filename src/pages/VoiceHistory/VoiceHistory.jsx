import React, { useEffect, useState } from 'react'
import { api } from '../../services/apiClient'

const VOICE_HISTORY_URL = 'http://172.30.34.82:8000/voice/history'

const normalizeVoiceItems = (payload) => {
    if (Array.isArray(payload?.items)) return payload.items
    if (Array.isArray(payload?.data?.items)) return payload.data.items
    return Array.isArray(payload) ? payload : []
}

function VoiceHistory() {
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    const fetchVoiceHistory = async (page) => {
        try {
            setLoading(true)
            setError('')
            const payload = await api.get(`/voice/history?page=${page}&page_size=${pageSize}`)
            const items = normalizeVoiceItems(payload)
            setEntries(items)
            setTotalPages(payload?.total_pages || 1)
            setTotal(payload?.total || items.length)
        } catch (err) {
            console.error('Failed to fetch voice history', err)
            setError('Không tải được lịch sử giọng nói. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchVoiceHistory(currentPage)
    }, [currentPage])

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            setCurrentPage(page)
        }
    }

    return (
        <main className="history">
            <header className="history__header">
                <div>
                    <p className="dashboard__eyebrow">Lịch sử giọng nói</p>
                    <h1>Voice Commands</h1>
                    <p className="dashboard__subtitle">
                        Các câu lệnh và hành động đã được hệ thống xử lý.
                    </p>
                </div>
            </header>

            {error && <div className="alert alert--error">{error}</div>}

            <section className="history__table-wrapper">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Đang tải...</div>
                ) : entries.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        Không có dữ liệu.
                    </div>
                ) : (
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Nội dung</th>
                                <th>Hành động</th>
                                <th>Thiết bị</th>
                                <th>Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry, index) => (
                                <tr key={entry.id}>
                                    <td>#{(currentPage - 1) * pageSize + index + 1}</td>
                                    <td>{entry.raw ?? '—'}</td>
                                <td>
                                    {entry.action_name ? (
                                        <span
                                            className={`chip chip--${entry.action_name.toLowerCase()}`}
                                        >
                                            {entry.action_name}
                                        </span>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                    <td>{entry.device_name_vn ?? entry.device_name ?? '—'}</td>
                                    <td>{new Date(entry.created_at).toLocaleString('vi-VN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            {!loading && entries.length > 0 && (
                <div className="pagination">
                    <div className="pagination__info">
                        Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} của {total} kết quả
                    </div>
                    <div className="pagination__controls">
                        <button
                            className="pagination__button"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Trước
                        </button>
                        <div className="pagination__pages">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    className={`pagination__page ${currentPage === page ? 'pagination__page--active' : ''}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            className="pagination__button"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}

export default VoiceHistory

