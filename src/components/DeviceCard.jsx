function DeviceCard({ label, isOn, onToggle, loading }) {
    return (
        <article className="device-card">
            <div>
                <p className="device-card__eyebrow">Thiết bị</p>
                <h2>{label}</h2>
                <p className="device-card__status">
                    Trạng thái: <strong>{isOn ? 'Bật' : 'Tắt'}</strong>
                </p>
            </div>

            <button
                className={`toggle ${isOn ? 'toggle--on' : ''}`}
                onClick={onToggle}
                disabled={loading}
                type="button"
            >
                <span className="toggle__thumb" />
            </button>
        </article>
    )
}

export default DeviceCard

