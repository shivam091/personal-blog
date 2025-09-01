import { sampleOne } from "./../utils/sample";
import {
  SAMPLE_FIRST_NAMES,
  SAMPLE_LAST_NAMES,
  SAMPLE_EMAIL_DOMAINS,
  CAPITAL_ALPHABETS
} from "./../constants/sample-data"

export const generateFirstName = () => {
  return sampleOne(SAMPLE_FIRST_NAMES);
};

export const generateLastName = () => {
  return sampleOne(SAMPLE_LAST_NAMES);
};

export const generateFullName = () => {
  let firstName = generateFirstName();
  let lastName = generateLastName();
  let prefix, initial;

  // 25% chance of middle initial
  if (Math.random() <= 0.25) {
    initial = sampleOne(CAPITAL_ALPHABETS) + ".";
  }

  // 5% of Dr. prefix
  if (Math.random() <= 0.05) {
    prefix = "Dr.";
  }

  return [prefix, firstName, initial, lastName]
    .filter(Boolean)
    .join(" ");
};

export const generateEmailDomain = () => {
  return sampleOne(SAMPLE_EMAIL_DOMAINS);
};
