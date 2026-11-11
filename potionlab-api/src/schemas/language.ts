export const languageQuerySchema = {
  type: 'object',
  properties: {
    lang: {
      type: 'string',
      enum: ['en', 'ua'],
      description: 'Response language. Defaults to en when omitted.',
      examples: ['en'],
    },
  },
} as const;
