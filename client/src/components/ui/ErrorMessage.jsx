import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const ErrorMessage = ({
  message = 'Something went wrong. Please try again.',
  retryAction,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`rounded-2xl border border-rose-100 bg-rose-50/70 p-5 text-rose-900 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-rose-900">Error</h4>
          <p className="text-sm text-rose-700 mt-1">{message}</p>
          {retryAction && (
            <div className="mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={retryAction}
                icon={RefreshCw}
                className="bg-white/90 border-rose-200 text-rose-800 hover:bg-white"
              >
                Retry
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
