/**
 * AppText
 * Themed, variant-driven text component. Always prefer this over raw <Text>
 * so font sizes stay responsive and colors stay theme-aware.
 *
 * <AppText variant="h1">Welcome back</AppText>
 * <AppText variant="caption" color="textMuted">Last seen 2h ago</AppText>
 */
import React from 'react';
import { Text } from 'react-native';
import PropTypes from 'prop-types';
import { useAppTheme } from '../../theme';

const AppText = ({
  variant = 'body',
  color,
  align,
  style,
  numberOfLines,
  children,
  ...rest
}) => {
  const { theme } = useAppTheme();
  const variantStyle = theme.typographyVariants[variant] || theme.typographyVariants.body;
  const resolvedColor = color ? theme.colors[color] || color : theme.colors.text;

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        variantStyle,
        { color: resolvedColor, textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

AppText.propTypes = {
  variant: PropTypes.oneOf([
    'h1', 'h2', 'h3', 'h4', 'subtitle', 'body', 'bodySmall', 'caption', 'button', 'overline',
  ]),
  color: PropTypes.string, // theme color key ('text', 'primary', 'error'...) or raw hex
  align: PropTypes.oneOf(['auto', 'left', 'right', 'center', 'justify']),
  numberOfLines: PropTypes.number,
};

export default AppText;
