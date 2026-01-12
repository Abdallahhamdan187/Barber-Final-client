import React from 'react'

function ActionModal({
    open,
    title,
    message,
    confirmText = "OK",
    cancelText,
    onConfirm,
    onClose,
    danger = false,
}) {
    if (!open) return null; 

    return (
        <div className="am-overlay" role="dialog" aria-modal="true" onMouseDown={onClose}>
            <div className="am-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="am-header">
                    <h3 className="am-title">{title}</h3>
                    <button className="am-x" onClick={onClose} aria-label="Close">×</button>
                </div>

                <div className="am-body">
                    <p className="am-message">{message}</p>
                </div>

                <div className="am-footer">
                    {cancelText && (
                        <button className="am-btn am-btn-secondary" onClick={onClose}>
                            {cancelText}
                        </button>
                    )}
                    <button
                        className={`am-btn ${danger ? "am-btn-danger" : "am-btn-primary"}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ActionModal