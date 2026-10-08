import { APP_TEXT } from '@/constants';
import { styles } from '@/style';

export const ErrorFallback = () => (
  <div role="alert" style={styles.fallback}>
    {APP_TEXT.errorBoundary.message}
  </div>
);
