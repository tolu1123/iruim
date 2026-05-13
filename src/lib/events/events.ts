function computeStats(statuses: { [key: string]: boolean }[], needs: string[]) {
  const result: { [key: string]: number } = {};

  for (const need of needs) {
    // Initialize counts
    let fulfilled = 0;
    let notFulfilled = 0;

    for (const status of statuses) {
      if (status[need] === true) fulfilled++;
      else notFulfilled++;
    }

    result[need] = fulfilled;
    result[`${need}_not`] = notFulfilled;
  }

  return result;
}


export { computeStats };