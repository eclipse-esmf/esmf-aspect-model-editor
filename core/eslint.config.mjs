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
                'scope:samm',
                'scope:infrastructure',
                'scope:shared',
                'scope:esmf',
              ],
            },
            {
              sourceTag: 'scope:domain',
              onlyDependOnLibsWithTags: [
                'scope:domain',
                'scope:samm',
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
                'scope:samm',
                'scope:shared',
                'scope:esmf',
              ],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'scope:samm',
                'scope:esmf',
              ],
            },
            {
              sourceTag: 'scope:esmf',
              onlyDependOnLibsWithTags: [],
            },
            // Type hierarchy rules
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['*'],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:graph',
                'type:domain',
                'type:integration',
                'type:samm',
                'type:infrastructure',
                'type:data-access',
                'type:cache',
                'type:rdf',
                'type:sdk',
                'type:shared',
                'type:contracts',
              ],
            },
            {
              sourceTag: 'type:graph',
              onlyDependOnLibsWithTags: [
                'type:graph',
                'type:domain',
                'type:integration',
                'type:samm',
                'type:infrastructure',
                'type:data-access',
                'type:cache',
                'type:rdf',
                'type:sdk',
                'type:shared',
                'type:contracts',
              ],
            },
            {
              sourceTag: 'type:domain',
              onlyDependOnLibsWithTags: [
                'type:domain',
                'type:samm',
                'type:infrastructure',
                'type:data-access',
                'type:cache',
                'type:rdf',
                'type:sdk',
                'type:shared',
                'type:contracts',
              ],
            },
            {
              sourceTag: 'type:samm',
              onlyDependOnLibsWithTags: [
                'type:samm',
                'type:integration',
                'type:infrastructure',
                'type:data-access',
                'type:cache',
                'type:rdf',
                'type:sdk',
                'type:shared',
                'type:contracts',
              ],
            },
            {
              sourceTag: 'type:infrastructure',
              onlyDependOnLibsWithTags: [
                'type:infrastructure',
                'type:data-access',
                'type:cache',
                'type:rdf',
                'type:samm',
                'type:sdk',
                'type:shared',
                'type:contracts',
              ],
            },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: [
                'type:data-access',
                'type:sdk',
                'type:shared',
                'type:contracts',
              ],
            },
            {
              sourceTag: 'type:cache',
              onlyDependOnLibsWithTags: [
                'type:cache',
                'type:sdk',
                'type:shared',
                'type:contracts',
              ],
            },
            {
              sourceTag: 'type:rdf',
              onlyDependOnLibsWithTags: [
                'type:rdf',
                'type:data-access',
                'type:cache',
                'type:sdk',
                'type:shared',
                'type:contracts',
              ],
            },
            {
              sourceTag: 'type:sdk',
              onlyDependOnLibsWithTags: [],
            },
            {
              sourceTag: 'type:shared',
              onlyDependOnLibsWithTags: [
                'type:shared',
                'type:contracts',
                'type:sdk',
              ],
            },
            {
              sourceTag: 'type:contracts',
              onlyDependOnLibsWithTags: [
                'type:sdk',
              ],
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
