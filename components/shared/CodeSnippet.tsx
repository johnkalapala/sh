import React, { useState } from 'react';
import { Icons } from '../Icons';

interface CodeSnippetProps {
    code: string;
    language: string;
}

const CodeSnippet: React.FC<CodeSnippetProps> = ({ code, language }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-brand-bg rounded-lg border border-brand-border relative group">
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-brand-surface p-1.5 rounded-md text-brand-text-secondary hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
                {copied ? <Icons.status.ok className="text-brand-green" /> : <Icons.copy />}
            </button>
            <pre className="p-4 text-sm overflow-x-auto">
                <code className={`language-${language}`}>
                    {code}
                </code>
            </pre>
        </div>
    );
};

export default CodeSnippet;