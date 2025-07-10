/**
 * Created by fulle on 2025/07/10.
 */
// src/components/EnvTester.js
import React from 'react';

const EnvTester = () => {
    return (
        <div style={{ padding: '20px', background: '#f0f0f0' }}>
            <h3>Environment Variables</h3>
            <ul>
                {Object.keys(import.meta.env)
                    .filter(key => key.startsWith('VITE_'))
                    .map(key => (
                        <li key={key}>
                            <strong>{key}:</strong> {import.meta.env[key]}
                        </li>
                    ))}
            </ul>
        </div>
    );
};

export default EnvTester;