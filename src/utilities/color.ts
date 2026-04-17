// need this file to make a font color changer function based on the background - nav - widget color

/**
 * function changeTextColor
 * By default this will assign white for colors darker than the threshold and black lighter
 * But it can be used to choose between some other pair of colors to fit with other color schemes
 */
const changeTextColor = (textColor: string, colorIfBright: string = 'black', colorIfDark: string = 'white') => {
  if (textColor.slice(0, 4) === 'rgba') {
    return changeRGBAColor(textColor) ? colorIfBright : colorIfDark;
  } else {
    return changeHexColor(textColor) ? colorIfBright : colorIfDark;
  }
};

const changeHexColor = (textColor: string) => {
  const hex = textColor.replace('#', '');

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

const changeRGBAColor = (rgba: string) => {
  // I am going to assume that this is of the form rgba(#, #, #, #);

  const values = rgba.slice(5, rgba.length - 2); // remove rgba( and )
  // drops the a value
  const [r, g, b] = values.split(',').map(value => Math.trunc(parseFloat(value))); // split on commas

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 155;
};

export default changeTextColor