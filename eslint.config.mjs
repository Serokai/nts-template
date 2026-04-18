import tsParser from "@typescript-eslint/parser";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^@rbxts"],
            ["^@quenty"],
            ["^\\w"],
            ["^src/"],
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "unused-imports/no-unused-imports": "warn",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["types/nevermore", "types/nevermore/*"],
              message:
                "Import from '@quenty/<pkg>' instead. 'types/nevermore/' is the overlay source — importing from it compiles but silently degrades types to 'any' whenever a transitive @quenty package isn't installed.",
            },
          ],
        },
      ],
    },
  },
];
