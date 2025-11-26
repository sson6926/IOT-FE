import { useState, useEffect } from 'react'
import React from 'react'
import { api } from '../../services/apiClient'

const formatDateTime = (isoString) =>
    new Date(isoString).toLocaleString('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
    })

function History() {
    const [historyData, setHistoryData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        let isMounted = true

        const fetchHistory = async () => {
            try {
                setLoading(true)
                setError('')
                const payload = await api.get(`/history/?page=${currentPage}&page_size=${pageSize}`)
                if (!isMounted) return

                const items = Array.isArray(payload?.items) 
                    ? payload.items 
                    : Array.isArray(payload) 
                        ? payload 
                        : []

                setHistoryData(items)
                setTotalPages(payload?.total_pages || 1)
                setTotal(payload?.total || 0)
            } catch (err) {
                if (!isMounted) return
                console.error('Failed to fetch history', err)
                setError('Không tải được lịch sử. Vui lòng thử lại.')
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchHistory()

        return () => {
            isMounted = false
        }
    }, [currentPage, pageSize])

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }

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

            {error && (
                <div className="alert alert--error">{error}</div>
            )}

            <section className="history__table-wrapper">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        Đang tải...
                    </div>
                ) : historyData.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                        Không có dữ liệu lịch sử
                    </div>
                ) : (
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
                )}
            </section>

            {!loading && historyData.length > 0 && (
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
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    // Hiển thị trang đầu, cuối, trang hiện tại và 2 trang xung quanh
                                    return page === 1 || 
                                           page === totalPages || 
                                           (page >= currentPage - 1 && page <= currentPage + 1)
                                })
                                .map((page, index, array) => {
                                    // Thêm ellipsis nếu có khoảng cách
                                    const showEllipsisBefore = index > 0 && page - array[index - 1] > 1
                                    return (
                                        <React.Fragment key={page}>
                                            {showEllipsisBefore && <span className="pagination__ellipsis">...</span>}
                                            <button
                                                className={`pagination__page ${currentPage === page ? 'pagination__page--active' : ''}`}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </button>
                                        </React.Fragment>
                                    )
                                })}
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

export default History;