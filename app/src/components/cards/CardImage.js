import React, { useRef } from 'react';
import { Text, StyleSheet, Animated, ImageBackground } from 'react-native';
import CachedImage from 'react-native-expo-cached-image';
import sha1 from 'crypto-js/sha1';

const styles = StyleSheet.create({
    innerImage: {
        height: '100%',
        width: 365, //hard coded for now
        flexDirection: 'row'
    },
    overlay: {
      textAlign: 'right',
      fontWeight: 'bold',
      fontSize: 20,
      alignSelf: 'center',
      top: '-5%',
      left: '53%',
      flex: 0.6
    }
});

/**
 * Generates a contrasting rgb value based on the supplied parameter
 * @param {string} string - rgb string
 * @returns {string} rgb string value
 */
function contrastRGB(string) {
  let color = string.split(',');
  color[0] = color[0].replace("rgb(", '');
  let colorRGB = { r: parseInt(color[0]), 
                   g: parseInt(color[1]),
                   b: parseInt(color[2])};
  // use the color brightness algorithm: https://www.w3.org/WAI/ER/WD-AERT/#color-contrast
  // [0, 255] range
  let brightness =(colorRGB.r * 299 + colorRGB.g * 587 + colorRGB.b * 114) / 1000;
  // return contrasting (white/black) color depending on the brightness
  return brightness > 128 ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)";
}

/**
 * Generates an rgb value based on the named passed in
 * @param {string} string - The name of a credit card
 * @returns {string} rgb string value
 */
function generateColor(string) {
  let hashColor = sha1(string).toString().substring(0, 6);
  let colorRGB = { r: parseInt(hashColor.substring(0, 2), 16),
                   g: parseInt(hashColor.substring(2, 4), 16),
                   b: parseInt(hashColor.substring(4, 6), 16)};
  return "rgb(" + colorRGB.r + ", " + colorRGB.g + ", " + colorRGB.b + ")";
}

/**
 * Component that displays a Credit Card Image. Either the card
 * image supplied via url will be displayed or a colorized background with a card's
 * name if no url is supplied.
 * 
 * @param {boolean} props.default - If true will return a colorized image with card's name. If false, the image supplied via source will be used
 * @param {string} props.source - Url of the image to be displayed if @props.default is true
 * @param {string} props.overlay - Name of the card to be overlayed on top of the image
 * @param {*} props.style - Style properties that will be passed down to the Image component
 * @component
 *      
 */
function CardImage (props) {
    const cardOpacity = useRef(new Animated.Value(0)).current;

    /**
     * Starts any animations that are necessary after a card image has been loaded
     */
    let onCardLoad = () => {
        Animated.timing(cardOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }

    const AnimatedCachedImage = Animated.createAnimatedComponent(CachedImage);

    if (props.default) {
        let generatedColor = generateColor(props.overlay);
        return (
            <Animated.View style={[{justifyContent: 'center', alignItems: 'center'}, props.style]}>
              <ImageBackground style={styles.innerImage}
                               source={require('../../../assets/cards/blank.png')}
                               imageStyle={props.overlay.length == 0 ? {} : {tintColor: generatedColor, resizeMode: "contain"}}>
                <Text style={[{color: contrastRGB(generatedColor)}, styles.overlay]}>{props.overlay}</Text>
              </ImageBackground>
            </Animated.View>
          );
    } else {
        return (
        <AnimatedCachedImage
            style={[{justifyContent: 'center', alignItems: 'center'}, props.style, { opacity: cardOpacity} ]}
            onLoad={() => {onCardLoad()}}
            source={{uri: props.source}}
        />);
    }
}

export default CardImage;