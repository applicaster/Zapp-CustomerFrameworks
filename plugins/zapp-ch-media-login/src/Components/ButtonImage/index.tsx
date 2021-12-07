import React from "react";
import PropTypes from "prop-types";
import { Image, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  image: {
    width: 40,
    height: 40,
  },
});

const ButtonImage = ({ imageSrc, style }: ButtonImageProps) => (
  <Image style={styles.image} source={{ uri: imageSrc }} />
);

ButtonImage.propTypes = { imageSrc: PropTypes.string };

export default ButtonImage;
