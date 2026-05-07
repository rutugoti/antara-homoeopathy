import React, { useEffect } from 'react';
import useUiStore from '../../store/uiStore';

export function PageWrapper({ title, children }) {
  const setPageTitle = useUiStore((state) => state.setPageTitle);

  useEffect(() => {
    setPageTitle(title);
  }, [title, setPageTitle]);

  return <>{children}</>;
}
