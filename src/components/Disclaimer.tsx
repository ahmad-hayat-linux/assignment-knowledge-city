import { DISCLAIMER_TEXT } from '@/constants';
import { styles } from '@/style';
import type { DisclaimerProps } from '@/types';

export const Disclaimer = ({ showNotice }: DisclaimerProps) =>
  showNotice ? <p style={styles.disclaimer}>{DISCLAIMER_TEXT}</p> : null;
