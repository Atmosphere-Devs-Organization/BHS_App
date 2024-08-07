// ProfileButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import Numbers from '@/constants/Numbers';

interface ProfileButtonProps {
  scrollY: Animated.Value;
  onPress: () => void;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ scrollY, onPress }) => {
  const profileButtonOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const profileButtonTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50], // Adjust as needed for fade effect
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.profileButtonContainer,
        {
          opacity: profileButtonOpacity,
          transform: [{ translateY: profileButtonTranslateY }],
        }
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={styles.profileButton}
        activeOpacity={1} // Ensures no opacity change on press
      >
        <Ionicons
          name="person-circle-sharp"
          size={Numbers.profileButtonSize}
          color={Colors.profileButton}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  profileButtonContainer: {
    position: 'absolute',
    top: 40, // Adjusted to move slightly down from the top
    right: 20,
    zIndex: 1,
  },
  profileButton: {
    borderColor: 'gray',
    borderWidth: 3,
    padding: 10,
  },
});

export default ProfileButton;