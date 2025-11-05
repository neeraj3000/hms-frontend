import React from 'react';
import { Thermometer, Weight, Activity } from 'lucide-react';

interface PatientVitalSignsProps {
  formData: {
    temperature: string;
    bloodPressureSystolic: string;
    bloodPressureDiastolic: string;
    weight: string;
  };
  errors: { [key: string]: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PatientVitalSigns: React.FC<PatientVitalSignsProps> = ({
  formData,
  errors,
  onChange,
}) => {
  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-green-600" />
        Vital Signs (Optional)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2">
            Temperature (°F)
          </label>
          <div className="relative">
            <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              id="temperature"
              name="temperature"
              value={formData.temperature}
              onChange={onChange}
              placeholder="98.6"
              step="0.1"
              suppressHydrationWarning
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.temperature ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.temperature && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              {errors.temperature}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blood Pressure
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              name="bloodPressureSystolic"
              value={formData.bloodPressureSystolic}
              onChange={onChange}
              placeholder="120"
              suppressHydrationWarning
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="flex items-center px-2 text-gray-500">/</span>
            <input
              type="number"
              name="bloodPressureDiastolic"
              value={formData.bloodPressureDiastolic}
              onChange={onChange}
              placeholder="80"
              suppressHydrationWarning
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
            Weight (kg)
          </label>
          <div className="relative">
            <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={onChange}
              placeholder="70"
              step="0.1"
              suppressHydrationWarning
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.weight ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.weight && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              {errors.weight}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientVitalSigns;
