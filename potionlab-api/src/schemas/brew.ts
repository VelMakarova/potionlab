export const brewResultSchema = {
  description:
    'A normal gameplay outcome or a brewed potion with a mock AI description.',
  anyOf: [
    {
      type: 'object',
      required: ['status'],
      additionalProperties: false,
      properties: {
        status: {
          type: 'string',
          enum: ['no_magic', 'explosion', 'cracked', 'runaway', 'useless'],
        },
      },
    },
    {
      type: 'object',
      required: ['status', 'properties', 'description'],
      additionalProperties: false,
      properties: {
        status: { type: 'string', enum: ['brewed'] },
        properties: {
          type: 'object',
          minProperties: 1,
          additionalProperties: { type: 'integer', minimum: 1 },
        },
        description: { type: 'string', examples: ['Тут буде текст від ШІ'] },
      },
    },
  ],
} as const;
