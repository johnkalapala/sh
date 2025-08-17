
import { Bond, CreditRating } from '../types';

// Flexible column mapping to handle variations in CSV headers, based on real data sources
const COLUMN_MAPPINGS: Partial<Record<keyof Bond, string[]>> = {
  isin: ['isin', 'ISIN'],
  name: ['name', 'bond_name', 'security description', 'Security_Description', 'Issuer Name'],
  issuer: ['issuer', 'issuer_name', 'Issuer_Name'],
  coupon: ['coupon', 'coupon_rate', 'Coupon Rate', 'Coupon', 'YTM'],
  maturityDate: ['maturityDate', 'maturity_date', 'Maturity Date'],
  creditRating: ['creditRating', 'rating', 'Credit_Rating', 'Credit Rating'],
  currentPrice: ['currentPrice', 'price', 'last_price', 'Close', 'close_price', 'LTP'],
  volume: ['volume', 'trading_volume', 'Traded Value', 'TradedValue', 'Trading_Volume'],
};

function findHeader(headers: string[], possibleNames: string[]): string | undefined {
  for (const name of possibleNames) {
    const header = headers.find(h => h.toLowerCase().trim().replace(/_/g, ' ') === name.toLowerCase());
    if (header) return header;
  }
  return undefined;
}

// Robust CSV parser that handles quoted fields
function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let currentField = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i-1] !== '\\')) { // Handle escaped quotes later if needed
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(currentField.trim());
            currentField = '';
        } else {
            currentField += char;
        }
    }
    result.push(currentField.trim().replace(/^"|"$/g, '')); // Trim and remove surrounding quotes
    return result;
}

// Asynchronous, chunk-based CSV parser
export const parseBondData = (file: File, onProgress: (progress: number) => void): Promise<Bond[]> => {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.csv')) {
      return reject('Invalid file type. Please upload a CSV file.');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split(/\r\n|\n/);
        if (lines.length < 2) {
          return reject('CSV file is empty or has no data rows.');
        }
        
        const headers = parseCsvLine(lines[0]).map(h => h.trim());
        const bonds: Bond[] = [];

        const fieldMap: { [key in keyof Bond]?: string } = {};
        for (const key in COLUMN_MAPPINGS) {
            const bondKey = key as keyof Bond;
            const header = findHeader(headers, COLUMN_MAPPINGS[bondKey]!);
            if(header) {
                fieldMap[bondKey] = header;
            }
        }

        if (!fieldMap.isin) {
            return reject('Required column "ISIN" not found in the file. Please ensure your file has an "ISIN" column.');
        }

        let i = 1;
        const totalLines = lines.length - 1;

        const processChunk = () => {
            const chunkSize = 1000; // Process 1000 lines at a time
            const chunkEnd = Math.min(i + chunkSize, lines.length);

            for (; i < chunkEnd; i++) {
                if (!lines[i]) continue;
                const values = parseCsvLine(lines[i]);
                const row: { [key: string]: string } = headers.reduce((obj, header, index) => {
                    obj[header] = values[index] || '';
                    return obj;
                }, {} as { [key: string]: string });
                
                const isin = row[fieldMap.isin!]?.trim();
                if (!isin) continue; // Skip rows without an ISIN

                const coupon = parseFloat(row[fieldMap.coupon!] || '0');
                const price = parseFloat(row[fieldMap.currentPrice!] || '100');
                const volume = parseInt(row[fieldMap.volume!]?.replace(/,/g, '') || '0', 10);
                
                const bond: Bond = {
                    id: isin,
                    isin: isin,
                    name: row[fieldMap.name!] || 'N/A',
                    issuer: row[fieldMap.issuer!] || row[fieldMap.name!] || 'N/A',
                    coupon: isNaN(coupon) ? 0 : coupon,
                    maturityDate: row[fieldMap.maturityDate!] || 'N/A',
                    creditRating: (row[fieldMap.creditRating!] as CreditRating) || CreditRating.A,
                    currentPrice: isNaN(price) ? 100 : price,
                    volume: isNaN(volume) ? 0 : volume,
                    aiFairValue: price * 1.005,
                    standardFairValue: price * 1.002,
                    bidAskSpread: Math.random() * 0.5,
                    dayChange: (Math.random() - 0.5) * 0.5,
                    riskValueScore: Math.floor(Math.random() * 40) + 60,
                    prePlatformVolume: volume / (Math.floor(Math.random() * 20) + 10),
                    prePlatformInvestors: Math.floor(Math.random() * 200) + 50,
                };
                bonds.push(bond);
            }

            const progress = (i / totalLines) * 100;
            onProgress(progress);

            if (i < lines.length) {
                setTimeout(processChunk, 0); // Yield to the main thread
            } else {
                if (bonds.length === 0) {
                    return reject('Could not find any valid bond data in the file. Please check the file format and column headers.');
                }
                resolve(bonds);
            }
        };

        processChunk();

      } catch (err) {
        reject('An unexpected error occurred while parsing the file. Please ensure it is a valid CSV.');
      }
    };

    reader.onerror = () => {
      reject('Failed to read the file.');
    };

    reader.readAsText(file);
  });
};
