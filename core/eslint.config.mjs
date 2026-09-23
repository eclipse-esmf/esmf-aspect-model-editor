import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: ['^.*/environments/.*', '^.*/package.json$'],
          depConstraints: [
            // Layer hierarchy rules: strictly unidirectional flow downward
            {
              sourceTag: 'layer:shell',
              onlyDependOnLibsWithTags: ['*'],
            },
            {
              sourceTag: 'layer:features',
              onlyDependOnLibsWithTags: [
                'layer:features',
                'layer:graph',
                'layer:domain',
                'layer:samm',
                'layer:infrastructure',
                'layer:shared',
                'layer:esmf',
              ],
            },
            {
              sourceTag: 'layer:graph',
              onlyDependOnLibsWithTags: [
                'layer:graph',
                'layer:domain',
                'layer:infrastructure',
                'layer:shared',
                'layer:esmf',
              ],
            },
            {
              sourceTag: 'layer:domain',
              onlyDependOnLibsWithTags: [
                'layer:domain',
                'layer:infrastructure',
                'layer:shared',
                'layer:esmf',
              ],
            },
            {
              sourceTag: 'layer:samm',
              onlyDependOnLibsWithTags: [
                'layer:samm',
                'layer:infrastructure',
                'layer:shared',
                'layer:esmf',
              ],
            },
            {
              sourceTag: 'layer:infrastructure',
              onlyDependOnLibsWithTags: [
                'layer:infrastructure',
                'layer:shared',
                'layer:esmf',
              ],
            },
            {
              sourceTag: 'layer:shared',
              onlyDependOnLibsWithTags: [
                'layer:shared',
                'layer:esmf',
              ],
            },
            {
              sourceTag: 'layer:esmf',
              onlyDependOnLibsWithTags: [],
            },
            // Scope hierarchy rules
            {
              sourceTag: 'scope:shell',
              onlyDependOnLibsWithTags: ['*'],
            },
            {
              sourceTag: 'scope:features',
              onlyDependOnLibsWithTags: [
                'scope:features',
                'scope:graph',
                'scope:domain',
                'scope:samm',
                'scope:infrastructure',
                'scope:shared',
                'scope:esmf',
              ],
            },
            {
              sourceTag: 'scope:graph',
              onlyDependOnLibsWithTags: [
                'scope:graph',
                'scope:domain',
                'scope:infrastructure',
                'scope:shared',
                'scope:esmf',
              ],
            },
            {
              sourceTag: 'scope:domain',
              onlyDependOnLibsWithTags: [
                'scope:domain',
                'scope:infrastructure',
                'scope:shared',
                'scope:esmf',
              ],
            },
            {
              sourceTag: 'scope:samm',
              onlyDependOnLibsWithTags: [
                'scope:samm',
                'scope:infrastructure',
                'scope:shared',
                'scope:esmf',
              ],
            },
            {
              sourceTag: 'scope:infrastructure',
              onlyDependOnLibsWithTags: [
                'scope:infrastructure',
                'scope:shared',
                'scope:esmf',
              ],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'scope:esmf',
              ],
            },
            {
              sourceTag: 'scope:esmf',
              onlyDependOnLibsWithTags: [],
            },
          ],
        },
      ],
    },
  },
  ...nx.configs['flat/typescript'],
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-prototype-builtins': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'no-extra-boolean-cast': 'off',
      'no-extra-semi': 'off',
    },
  },
  ...nx.configs['flat/javascript'],
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {
      'no-var': 'error',
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'no-extra-semi': 'off',
    },
  },
];
