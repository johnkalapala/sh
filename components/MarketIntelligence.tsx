import React, { useState, useEffect } from 'react';
import { generateMarketNewsAnalysis } from '../services/geminiService';
import { Icons } from './Icons';
import Spinner from './shared/Spinner';

const MarketIntelligence: React.FC = () => {
    const [news, setNews] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchNews = async () => {
        setIsLoading(true);
        try {
            const result = await generateMarketNewsAnalysis();
            setNews(result);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to fetch market news:", error);
            setNews("<p>Error: Could not load market intelligence feed.</p>");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchNews();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center space-x-2">
                    <Icons.zap className="text-brand-yellow" />
                    <h3 className="text-xl font-semibold">Market Intelligence</h3>
                </div>
                <button onClick={fetchNews} disabled={isLoading} className="text-xs text-brand-text-secondary hover:text-brand-primary disabled:opacity-50">
                    Refresh
                </button>
            </div>
            
            <div className="h-[280px] overflow-y-auto pr-2">
                 {isLoading ? <Spinner /> : (
                    <div className="gemini-analysis text-brand-text-secondary" dangerouslySetInnerHTML={{ __html: news }} />
                )}
            </div>
             <p className="text-xs text-brand-text-secondary text-right mt-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
        </div>
    );
};

export default MarketIntelligence;