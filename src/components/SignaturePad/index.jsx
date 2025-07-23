/**
 * Created by fulle on 2025/07/08.
 */
import React, { useRef, useEffect, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

const SignaturePad = ({ onSave, signatureData }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [saved, setSaved] = React.useState(false);
    const contextRef = useRef(null);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions to match display size
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#000';

        contextRef.current = ctx;

        // Load existing signature if provided
        if (signatureData) {
            loadSignature(signatureData);
        }
    }, []);

    const loadSignature = (dataURL) => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        const img = new Image();

        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            setSaved(true);
        };

        img.src = dataURL;
    };

    const startDrawing = useCallback(({ nativeEvent }) => {
        const { offsetX, offsetY } = getCoordinates(nativeEvent);
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
        setSaved(false);
    }, []);

    const draw = useCallback(({ nativeEvent }) => {
        if (!isDrawing) return;

        const { offsetX, offsetY } = getCoordinates(nativeEvent);
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    }, [isDrawing]);

    const endDrawing = useCallback(() => {
        contextRef.current.closePath();
        setIsDrawing(false);
    }, []);

    const getCoordinates = (event) => {
        if (event.touches) {
            const rect = canvasRef.current.getBoundingClientRect();
            return {
                offsetX: event.touches[0].clientX - rect.left,
                offsetY: event.touches[0].clientY - rect.top
            };
        }
        return {
            offsetX: event.offsetX,
            offsetY: event.offsetY
        };
    };

    const saveSignature = () => {
        const dataURL = canvasRef.current.toDataURL('image/png');
        onSave(dataURL);
        setSaved(true);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSaved(false);
    };

    return (
        <div className="signature-pad-container">
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
                className="border rounded bg-light"
                style={{ width: '100%', height: '200px', touchAction: 'none' }}
                aria-label="Signature canvas"
                role="application"
            />

            <div className="d-flex justify-content-between mt-2">
                <Button
                    variant="outline-danger"
                    onClick={clearCanvas}
                    aria-label="Clear signature"
                >
                    Clear
                </Button>

                <div className="d-flex align-items-center">
                    {saved && (
                        <span className="text-success me-2" aria-hidden="true">
              ✓ Signature saved
            </span>
                    )}
                    <Button
                        variant="primary"
                        onClick={saveSignature}
                        aria-label="Save signature"
                    >
                        {saved ? 'Update Signature' : 'Save Signature'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

SignaturePad.propTypes = {
    onSave: PropTypes.func.isRequired,
    signatureData: PropTypes.string
};

export default SignaturePad;