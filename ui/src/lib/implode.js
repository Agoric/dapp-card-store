const IMPLODE_PREFIX = 'SN:';

export const implode = (strongname) => {
  return `${IMPLODE_PREFIX}${JSON.stringify(strongname)}`;
};

export const explode = (data) => {
  if (typeof data !== 'string' || !data.startsWith(IMPLODE_PREFIX)) {
    throw Error(
      `Exploded data ${data} must be a string that starts with ${IMPLODE_PREFIX}`,
    );
  }
  return JSON.parse(data.slice(IMPLODE_PREFIX.length));
};
