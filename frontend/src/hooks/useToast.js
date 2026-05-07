import { toast } from 'sonner';

export function useToast() {
  const showSuccess = (message) => {
    toast.success(message);
  };

  const showError = (error) => {
    const message = error?.response?.data?.message || error?.message || 'An error occurred';
    toast.error(message);
  };

  const showInfo = (message) => {
    toast.info(message);
  };

  return { showSuccess, showError, showInfo };
}
