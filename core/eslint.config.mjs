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
            // Feature libs are isolated: no dependency on the shell or on other features.
            // Cross-feature communication goes through @ame/domain stores, facades and ports.
            {
              sourceTag: 'type:feature',
              notDependOnLibsWithTags: ['type:shell', 'type:feature'],
            },
            // The workbench shell composes features and reads domain state; wiring lives in the app.
            {
              sourceTag: 'type:shell',
              onlyDependOnLibsWithTags: ['layer:features', 'layer:domain', 'layer:shared', 'layer:esmf'],
            },
            // UI features without own graph rendering only talk to the domain (stores, facades, ports).
            {
              sourceTag: 'access:domain-only',
              onlyDependOnLibsWithTags: ['layer:domain', 'layer:shared', 'layer:esmf'],
            },
            // Layer hierarchy rules: strictly unidirectional flow downward
            {
              sourceTag: 'layer:shell',
              // The app is the composition root and wires all libraries together.
              onlyDependOnLibsWithTags: [
                'layer:features',
                'layer:graph',
                'layer:domain',
                'layer:infrastructure',
                'layer:shared',
                'layer:esmf',
              ],
            },
            {
              sourceTag: 'layer:features',
              onlyDependOnLibsWithTags: [
                'layer:features',
                'layer:graph',
                'layer:domain',
                'layer:shared',
                'layer:esmf',
              ],
            },
            {
              sourceTag: 'layer:graph',
              onlyDependOnLibsWithTags: [
                'layer:graph',
                'layer:domain',
                'layer:shared',
                'layer:esmf',
              ],
            },
            {
              sourceTag: 'layer:domain',
              onlyDependOnLibsWithTags: [
                'layer:domain',
                'layer:shared',
                'layer:esmf',
              ],
            },
            {
              sourceTag: 'layer:infrastructure',
              onlyDependOnLibsWithTags: [
                'layer:infrastructure',
                'layer:domain',
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
              onlyDependOnLibsWithTags: [
                'scope:features',
                'scope:graph',
                'scope:domain',
                'scope:infrastructure',
                'scope:shared',
                'scope:esmf',
              ],
            },
            {
              sourceTag: 'scope:features',
              onlyDependOnLibsWithTags: [
                'scope:features',
                'scope:graph',
                'scope:domain',
                'scope:shared',
                'scope:esmf',
              ],
            },
            {
              sourceTag: 'scope:graph',
              onlyDependOnLibsWithTags: [
                'scope:graph',
                'scope:domain',
                'scope:shared',
                'scope:esmf',
              ],
            },
            {
              sourceTag: 'scope:domain',
              onlyDependOnLibsWithTags: [
                'scope:domain',
                'scope:shared',
                'scope:esmf',
              ],
            },
            {
              sourceTag: 'scope:infrastructure',
              onlyDependOnLibsWithTags: [
                'scope:infrastructure',
                'scope:domain',
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
