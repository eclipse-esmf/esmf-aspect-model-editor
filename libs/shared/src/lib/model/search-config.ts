export const unitSearchOption = {
  useExtendedSearch: true, // enable special search ex: *value = items that include value
  includeScore: true, // add score for each list entry
  keys: ['name'], // object attribute to consider for search
  threshold: 0.0, // score needed by list entries in order to be returned by search (0.0 =  perfect match, 1.0 = match anything).
};

export const mxCellSearchOption = {
  useExtendedSearch: true,
  includeScore: true,
  keys: ['id'],
  threshold: 0.1,
};

export const entityValueSearchOption = {
  useExtendedSearch: true,
  includeScore: true,
  keys: ['name'],
  threshold: 0.0,
};
