export const provideMockObject = <T>(service: T) => {
  if (typeof service !== 'function') {
    throw new Error('"service" needs to be a class or function');
  }

  const object: any = {};
  for (const key in service.prototype) {
    if (!service.prototype[key]) {
      continue;
    }

    if (typeof service.prototype[key] === 'function') {
      object[key] = jest.fn();
      continue;
    }

    object[key] = service.prototype[key];
  }

  return object;
};
