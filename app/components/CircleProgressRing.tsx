import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface Props {
  total: number;
  confirmed: number;
  size?: number;
  strokeWidth?: number;
}

export default function CircleProgressRing({ total, confirmed, size = 200, strokeWidth = 16 }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  if (total === 0) {
    return (
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={center} cy={center} r={radius}
            fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth}
          />
        </Svg>
      </View>
    );
  }

  const segmentAngle = (2 * Math.PI) / total;
  const gap = 0.04; // radians gap between segments

  const segments = Array.from({ length: total }, (_, i) => {
    const isConfirmed = i < confirmed;
    const startAngle = i * segmentAngle - Math.PI / 2;
    const endAngle = startAngle + segmentAngle - gap;

    const arcLength = (segmentAngle - gap) * radius;
    const dashArray = `${arcLength} ${circumference - arcLength}`;
    const dashOffset = -startAngle * radius;

    return { isConfirmed, dashArray, dashOffset };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={center} cy={center} r={radius}
          fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth}
        />
        <G>
          {segments.map((seg, i) => (
            <Circle
              key={i}
              cx={center} cy={center} r={radius}
              fill="none"
              stroke={seg.isConfirmed ? '#16A34A' : '#E5E7EB'}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="round"
            />
          ))}
        </G>
      </Svg>
    </View>
  );
}
