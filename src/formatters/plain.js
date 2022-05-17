import _ from 'lodash';

export default (inputTree) => {
  const buildString = (layout, notice, ...options) => {
    const [option1, option2] = options.filter((el) => !_.isUndefined(el))
      .map((el) => ((typeof el === 'string') ? `'${el}'` : el))
      .map((el) => (_.isObject(el) ? `${'[complex value]'}` : el));
    const prefix = `Property '${layout}' was`;
    const getBody = (action) => {
      switch (action) {
        case 'removed': return 'removed';
        case 'added': return `added with value: ${option1}`;
        case 'updated': return `updated. From ${option1} to ${option2}`;
        default: return '. Something went wrong';
      }
    };
    const body = getBody(notice);
    return `${prefix} ${body}`;
  };
  const buildComparison = (tree, root = []) => {
    const branchesData = tree.map((branch) => branch[_.head(Object.keys(branch))]);
    const keys = branchesData.map((branch) => Object.keys(branch)).flat();
    const branches = tree.map((branch) => {
      const [branchData, mark] = Object.keys(branch).map((key) => branch[key]);
      const leafs = Object.entries(branchData)
        .map(([key, value]) => {
          const newRoot = [...root, key];
          const rootForPrint = newRoot.join('.');
          const isUniq = keys.filter((el) => _.isEqual(el, key)).length === 1;
          const getStaitment = (sign, status) => {
            if (sign === '-' && status) return buildString(rootForPrint, 'removed');
            if (sign === ' ') return (_.isArray(value)) ? buildComparison(value, newRoot) : [];
            if (sign === '+' && status) return buildString(rootForPrint, 'added', value);
            if (sign === '-' && !status) {
              const [value1, value2] = branchesData.map((el) => _.get(el, key, [])).flat();
              return (buildString(rootForPrint, 'updated', value1, value2));
            }
            return [];
          };
          return getStaitment(mark, isUniq);
        }).flat();
      return leafs;
    }).flat();
    return branches.join('\n');
  };
  return buildComparison(inputTree);
};
