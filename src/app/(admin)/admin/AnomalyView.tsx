'use client';

import { AlertTriangle, TrendingUp, Activity, Shield } from 'lucide-react';
import { AnomalyAlert } from '../../../types';

interface AnomalyViewProps {
  anomalies: AnomalyAlert[];
}

export default function AnomalyView({ anomalies }: AnomalyViewProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 border-red-200 text-red-700';
      case 'medium': return 'bg-orange-100 border-orange-200 text-orange-700';
      default: return 'bg-yellow-100 border-yellow-200 text-yellow-700';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">AI Anomaly Detection</h2>
        <p className="text-sm sm:text-base text-gray-600">Monitor unusual patterns</p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {anomalies.map((anomaly) => (
          <div key={anomaly.id} className={`border rounded-lg p-3 sm:p-4 ${getSeverityColor(anomaly.severity)}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold mb-1">{anomaly.type}</h3>
                <p className="text-xs sm:text-sm">{anomaly.message}</p>
                {anomaly.details && <p className="text-xs sm:text-sm mt-2">{anomaly.details}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
