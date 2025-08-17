
import React from 'react';
import { Icons } from '../../Icons';

const DefaultTestView: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <Icons.lab className="h-16 w-16 text-brand-primary mb-4" />
            <h2 className="text-2xl font-bold text-white">Welcome to the System & Quantum Lab</h2>
            <p className="mt-2 max-w-md text-brand-text-secondary">
                This is the central control panel for simulating system-wide stress events and exploring the potential of quantum financial models.
            </p>
            <p className="mt-4 text-brand-text">
                &larr; Please select a test from the menu to begin.
            </p>
        </div>
    );
};

export default DefaultTestView;
