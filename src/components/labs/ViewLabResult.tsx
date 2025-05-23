import React from 'react';
import { X, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Button from '../ui/Button';
import { Lab } from '../../types';
import { patients, doctors } from '../../utils/mockData';

interface ViewLabResultProps {
  result: Lab;
  onClose: () => void;
}

const ViewLabResult: React.FC<ViewLabResultProps> = ({ result, onClose }) => {
  const patient = patients.find(p => p.id === result.patientId);
  const doctor = doctors.find(d => d.id === result.doctorId);

  const getStatusIcon = () => {
    switch (result.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'cancelled':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (result.status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Lab Result Details</h2>
            <p className="mt-1 text-sm text-gray-500">
              Test ID: {result.id}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            leftIcon={<X className="h-4 w-4" />}
          >
            Close
          </Button>
        </div>

        <div className="space-y-6">
          {/* Status Banner */}
          <div className={`flex items-center justify-between p-4 rounded-lg ${getStatusColor()}`}>
            <div className="flex items-center">
              {getStatusIcon()}
              <span className="ml-2 font-medium capitalize">{result.status}</span>
            </div>
            <span className="text-sm">
              {result.status === 'completed' && result.results && 'Results Available'}
              {result.status === 'pending' && 'Awaiting Results'}
              {result.status === 'cancelled' && 'Test Cancelled'}
            </span>
          </div>

          {/* Patient & Doctor Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Patient Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Name:</span> {patient?.firstName} {patient?.lastName}</p>
                <p><span className="text-gray-500">ID:</span> {patient?.id}</p>
                <p><span className="text-gray-500">Contact:</span> {patient?.contactNumber}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Ordering Physician</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Name:</span> Dr. {doctor?.firstName} {doctor?.lastName}</p>
                <p><span className="text-gray-500">Specialization:</span> {doctor?.specialization}</p>
                <p><span className="text-gray-500">Contact:</span> {doctor?.contactNumber}</p>
              </div>
            </div>
          </div>

          {/* Test Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">Test Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Test Type</p>
                <p className="font-medium">{result.testType}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{new Date(result.date).toLocaleDateString()}</p>
              </div>

              {result.results && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Results</p>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm">{result.results}</pre>
                  </div>
                </div>
              )}

              {result.reportUrl && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Report</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(result.reportUrl, '_blank')}
                  >
                    View Full Report
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => window.print()}
            >
              Print Results
            </Button>
            {result.status === 'completed' && (
              <Button>
                Download Report
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLabResult;