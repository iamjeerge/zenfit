/**
 * InteractiveChart — A set of beautiful, animated chart primitives
 * built with react-native-svg for high-quality rendering.
 *
 * Exports:
 *  - LineChart       : area/line chart with tooltip on press
 *  - BarChart        : animated bar chart
 *  - DonutChart      : animated donut/ring chart
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Circle,
  Rect,
  Line,
  G,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Colors, FontSizes, Spacing, BorderRadius } from '../theme/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width: SCREEN_W } = Dimensions.get('window');

// ── Helpers ────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function buildLinePath(points: { x: number; y: number }[], smooth = false): string {
  if (points.length < 2) return '';
  if (!smooth) {
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ');
  }
  // Smooth cubic bezier
  let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C${cpx.toFixed(1)},${prev.y.toFixed(1)} ${cpx.toFixed(1)},${curr.y.toFixed(1)} ${curr.x.toFixed(1)},${curr.y.toFixed(1)}`;
  }
  return d;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LineChart
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface LineDataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineDataPoint[];
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  height?: number;
  unit?: string;
  smooth?: boolean;
  showDots?: boolean;
  showLabels?: boolean;
}

export function LineChart({
  data,
  color = Colors.violet,
  gradientFrom = 'rgba(124,58,237,0.5)',
  gradientTo = 'rgba(124,58,237,0)',
  height = 160,
  unit = '',
  smooth = true,
  showDots = true,
  showLabels = true,
}: LineChartProps) {
  const [tooltip, setTooltip] = useState<{ index: number } | null>(null);
  const progress = useSharedValue(0);

  const padH = 16;
  const padV = 16;
  const W = SCREEN_W - Spacing.lg * 2 - 32; // card padding
  const H = height;

  const values = data.map((d) => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const points = data.map((d, i) => ({
    x: padH + (i / (data.length - 1)) * (W - padH * 2),
    y: padV + (1 - (d.value - minV) / range) * (H - padV * 2),
  }));

  const linePath = buildLinePath(points, smooth);
  const areaPath =
    linePath + ` L${points[points.length - 1].x},${H - padV} L${points[0].x},${H - padV} Z`;

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, [data]);

  const animatedLineProps = useAnimatedProps(() => ({
    strokeDashoffset: (1 - progress.value) * 2000,
    strokeDasharray: [2000, 2000] as [number, number],
  }));

  const animatedAreaProps = useAnimatedProps(() => ({
    opacity: progress.value * 0.7,
  }));

  const activePoint = tooltip !== null ? points[tooltip.index] : null;
  const activeData = tooltip !== null ? data[tooltip.index] : null;

  return (
    <View>
      <Svg width={W} height={H}>
        <Defs>
          <SvgLinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={gradientFrom} />
            <Stop offset="100%" stopColor={gradientTo} />
          </SvgLinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <Line
            key={i}
            x1={padH}
            y1={padV + t * (H - padV * 2)}
            x2={W - padH}
            y2={padV + t * (H - padV * 2)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        ))}

        {/* Area fill */}
        <AnimatedPath d={areaPath} fill="url(#lineGrad)" animatedProps={animatedAreaProps} />

        {/* Line */}
        <AnimatedPath
          d={linePath}
          stroke={color}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          animatedProps={animatedLineProps}
        />

        {/* Data dots */}
        {showDots &&
          points.map((p, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setTooltip(tooltip?.index === i ? null : { index: i })}
            >
              <Circle
                cx={p.x}
                cy={p.y}
                r={tooltip?.index === i ? 7 : 4}
                fill={tooltip?.index === i ? color : Colors.background}
                stroke={color}
                strokeWidth={2}
              />
            </TouchableOpacity>
          ))}

        {/* Tooltip vertical line */}
        {activePoint && (
          <Line
            x1={activePoint.x}
            y1={padV}
            x2={activePoint.x}
            y2={H - padV}
            stroke={color}
            strokeWidth={1}
            strokeDasharray={[4, 4]}
            opacity={0.6}
          />
        )}

        {/* X-axis labels */}
        {showLabels &&
          data.map((d, i) => (
            <SvgText
              key={i}
              x={points[i].x}
              y={H}
              textAnchor="middle"
              fontSize={9}
              fill={Colors.textMuted}
            >
              {d.label}
            </SvgText>
          ))}
      </Svg>

      {/* Tooltip popup */}
      {activeData && activePoint && (
        <View
          style={[
            styles.tooltip,
            {
              left: clamp(activePoint.x - 40, 0, W - 90),
              top: clamp(activePoint.y - 44, 0, H - 40),
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.tooltipLabel}>{activeData.label}</Text>
          <Text style={[styles.tooltipValue, { color }]}>
            {activeData.value.toLocaleString()}
            {unit}
          </Text>
        </View>
      )}
    </View>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BarChart
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface BarDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarDataPoint[];
  height?: number;
  unit?: string;
  goalLine?: number;
  barColor?: string;
  activeColor?: string;
}

export function BarChart({
  data,
  height = 160,
  unit = '',
  goalLine,
  barColor = Colors.violet,
  activeColor = Colors.lavender,
}: BarChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const W = SCREEN_W - Spacing.lg * 2 - 32;
  const H = height;
  const padH = 8;
  const padV = 12;
  const maxV = Math.max(...data.map((d) => d.value), goalLine ?? 0, 1);
  const barW = (W - padH * 2) / data.length - 6;

  const AnimatedRect = Animated.createAnimatedComponent(Rect);

  return (
    <View>
      <Svg width={W} height={H + 20}>
        {/* Goal line */}
        {goalLine && (
          <Line
            x1={padH}
            y1={padV + (1 - goalLine / maxV) * (H - padV * 2)}
            x2={W - padH}
            y2={padV + (1 - goalLine / maxV) * (H - padV * 2)}
            stroke="rgba(251,191,36,0.5)"
            strokeWidth={1.5}
            strokeDasharray={[6, 4]}
          />
        )}

        {data.map((d, i) => {
          const barHeight = Math.max((d.value / maxV) * (H - padV * 2), 4);
          const x = padH + i * ((W - padH * 2) / data.length) + 3;
          const y = padV + (H - padV * 2) - barHeight;
          const color = active === i ? (d.color ?? activeColor) : (d.color ?? barColor);

          return (
            <G key={i}>
              <Rect
                x={x}
                y={y}
                width={barW}
                height={barHeight}
                rx={4}
                fill={color}
                opacity={active === null || active === i ? 1 : 0.4}
                onPress={() => setActive(active === i ? null : i)}
              />
              <SvgText
                x={x + barW / 2}
                y={H + 16}
                textAnchor="middle"
                fontSize={9}
                fill={active === i ? Colors.textPrimary : Colors.textMuted}
                fontWeight={active === i ? '700' : '400'}
              >
                {d.label}
              </SvgText>
              {active === i && (
                <SvgText
                  x={x + barW / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize={10}
                  fill={Colors.textPrimary}
                  fontWeight="700"
                >
                  {d.value.toLocaleString()}
                  {unit}
                </SvgText>
              )}
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DonutChart
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface DonutProps {
  progress: number; // 0–1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

export function DonutChart({
  progress,
  size = 120,
  strokeWidth = 12,
  color = Colors.violet,
  backgroundColor = Colors.card,
  children,
}: DonutProps) {
  const anim = useSharedValue(0);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  useEffect(() => {
    anim.value = 0;
    anim.value = withTiming(Math.min(progress, 1), {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - anim.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Background ring */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <AnimatedPath
          d={`M ${cx} ${strokeWidth / 2} A ${r} ${r} 0 1 1 ${cx - 0.001} ${strokeWidth / 2}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90, ${cx}, ${cy})`}
        />
      </Svg>
      {children && <View style={{ position: 'absolute', alignItems: 'center' }}>{children}</View>}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    backgroundColor: Colors.cardHover,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    minWidth: 80,
    alignItems: 'center',
    zIndex: 10,
  },
  tooltipLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  tooltipValue: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    marginTop: 1,
  },
});
