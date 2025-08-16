import React, { useState, useEffect } from 'react';

interface OrderBookProps {
  currentPrice: number;
}

interface Order {
  price: number;
  size: number;
  cumulative: number;
}

const generateOrders = (price: number, count: number, type: 'bid' | 'ask'): Order[] => {
  let orders: Order[] = [];
  let cumulative = 0;
  for (let i = 0; i < count; i++) {
    const priceFluctuation = (Math.random() * 0.1) * (i + 1);
    const orderPrice = type === 'bid' ? price - priceFluctuation : price + priceFluctuation;
    const size = Math.floor(Math.random() * 50000) + 1000;
    cumulative += size;
    orders.push({ price: parseFloat(orderPrice.toFixed(2)), size, cumulative });
  }
  return orders;
};

const OrderBook: React.FC<OrderBookProps> = ({ currentPrice }) => {
  const [bids, setBids] = useState<Order[]>([]);
  const [asks, setAsks] = useState<Order[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newBids = generateOrders(currentPrice, 8, 'bid');
      const newAsks = generateOrders(currentPrice, 8, 'ask').sort((a,b) => a.price - b.price);
      setBids(newBids);
      setAsks(newAsks);
    }, 2000); // Update every 2 seconds

    // Initial load
    setBids(generateOrders(currentPrice, 8, 'bid'));
    setAsks(generateOrders(currentPrice, 8, 'ask').sort((a,b) => a.price - b.price));

    return () => clearInterval(interval);
  }, [currentPrice]);

  const maxCumulative = Math.max(bids[bids.length-1]?.cumulative || 0, asks[asks.length-1]?.cumulative || 0);

  return (
    <div className="text-xs font-mono">
      <div className="grid grid-cols-3 text-brand-text-secondary px-2 mb-2">
        <span className="text-left">Price (₹)</span>
        <span className="text-right">Size</span>
        <span className="text-right">Cumulative</span>
      </div>
      <div className="space-y-1">
        {asks.map((ask, index) => (
          <div key={index} className="relative h-5 flex items-center justify-between px-2">
             <div className="absolute top-0 left-0 h-full bg-red-500 bg-opacity-20" style={{ width: `${(ask.cumulative / maxCumulative) * 100}%` }} />
             <span className="relative text-brand-red">{ask.price.toFixed(2)}</span>
             <span className="relative">{ask.size.toLocaleString()}</span>
             <span className="relative">{ask.cumulative.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="py-2 my-1 text-center border-y border-brand-border">
          <span className="text-lg font-bold text-white">{currentPrice.toFixed(2)}</span>
      </div>
       <div className="space-y-1">
        {bids.map((bid, index) => (
          <div key={index} className="relative h-5 flex items-center justify-between px-2">
            <div className="absolute top-0 left-0 h-full bg-green-500 bg-opacity-20" style={{ width: `${(bid.cumulative / maxCumulative) * 100}%` }} />
            <span className="relative text-brand-green">{bid.price.toFixed(2)}</span>
            <span className="relative">{bid.size.toLocaleString()}</span>
            <span className="relative">{bid.cumulative.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBook;
