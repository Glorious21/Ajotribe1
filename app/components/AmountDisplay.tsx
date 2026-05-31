import { Text, TextStyle } from 'react-native';
import { formatNaira } from '../lib/formatNaira';

interface Props {
  amountKobo: number;
  size?: number;
  color?: string;
  center?: boolean;
  style?: TextStyle;
}

export function AmountDisplay({ amountKobo, size = 56, color = '#111827', center = false, style }: Props) {
  return (
    <Text
      style={[
        { fontSize: size, fontWeight: '800', color, textAlign: center ? 'center' : 'left' },
        style,
      ]}
      numberOfLines={1}
      adjustsFontSizeToFit
    >
      {formatNaira(amountKobo)}
    </Text>
  );
}
