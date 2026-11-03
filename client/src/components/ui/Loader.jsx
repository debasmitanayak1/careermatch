import { Spinner } from './Spinner';

export const Loader = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <Spinner size="lg" />
      <p className="text-slate-600 font-medium text-sm animate-pulse">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        {content}
      </div>
    );
  }

  return <div className="py-16 w-full flex items-center justify-center">{content}</div>;
};
