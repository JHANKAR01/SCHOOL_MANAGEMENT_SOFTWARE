import React from 'react';

export const SetupWizard: React.FC<any> = (props) => {
    return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-bold">Setup Wizard</h2>
            <p className="text-slate-500">Academic structure setup wizard coming soon.</p>
            {/* Debugging helpers */}
            <div className="hidden">{JSON.stringify(props)}</div>
        </div>
    );
};

