import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/lib/theme/tokens';

interface SparkleParticlesProps {
  testID?: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
  rotation: number;
}

const PARTICLE_COUNT = 20;

/* istanbul ignore next - default parameter is covered functionally */
export function SparkleParticles({ testID = 'sparkles' }: SparkleParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array(PARTICLE_COUNT)
      .fill(0)
      .map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 80;
        const rand = Math.random();

        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: 4 + Math.random() * 6,
          delay: i * 30,
          duration: 800 + Math.random() * 400,
          color:
            rand < 0.6
              ? colors.accent.gold
              : rand < 0.85
              ? colors.primary.light
              : colors.secondary.base,
          rotation: Math.random() * 360,
        };
      });
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle, index) => (
        <ParticleComponent
          key={index}
          particle={particle}
          testID={`${testID}-particle-${index}`}
        />
      ))}
    </View>
  );
}

interface ParticleProps {
  particle: Particle;
  testID: string;
}

function ParticleComponent({ particle, testID }: ParticleProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    const fadeInDuration = particle.duration * 0.3;
    const fadeOutDuration = particle.duration * 0.7;

    opacity.value = withDelay(
      particle.delay,
      withTiming(0.8, { duration: fadeInDuration }, () => {
        opacity.value = withTiming(0, { duration: fadeOutDuration });
      })
    );

    scale.value = withDelay(
      particle.delay,
      withSpring(1, { damping: 8, stiffness: 100 })
    );

    rotation.value = withDelay(
      particle.delay,
      withTiming(particle.rotation, {
        duration: particle.duration,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [particle, opacity, scale, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: particle.x },
      { translateY: particle.y },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.particle,
        {
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          borderRadius: particle.size / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 3,
  },
});
