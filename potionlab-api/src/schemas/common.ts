// List of elements. This is also main categories
export const elements = [
  'fire',
  'water',
  'air',
  'earth',
  'dark',
  'light',
] as const;

// List of properties. Describes the ingredient's effects
export const properties = [
  'heat',
  'power',
  'protection',
  'transformation',
  'poison',
  'purification',
  'concealment',
  'freezing',
  'mobility',
  'lightning',
  'growth',
  'preservation',
  'healing',
  'divination',
  'necromancy',
];

// Schema of a single Ingredient
export const ingredientSchema = {
  title: 'Ingredient',
  type: 'object',
  required: ['id', 'assets', 'name', 'description', 'element', 'properties'],
  properties: {
    id: { type: 'string', examples: ['dragon-scale'] },
    assets: {
      type: 'object',
      required: ['full', 'thumb128', 'thumb64'],
      properties: {
        full: { type: 'string' },
        thumb128: { type: 'string' },
        thumb64: { type: 'string' },
      },
    },
    name: { type: 'string', examples: ['Dragon Scale'] },
    description: { type: 'string' },
    element: { type: 'string', enum: elements },
    properties: { type: 'array', items: { type: 'string', enum: properties } },
  },
} as const;

// Schema of a list of Ingredients
export const ingredientListSchema = {
  type: 'array',
  items: ingredientSchema,
} as const;

// Schema for brewing a potion
export const ingredientIdsSchema = {
  type: 'array',
  minItems: 3,
  maxItems: 3,
  uniqueItems: true,
  description:
    'Exactly three distinct non-empty catalog ingredient IDs. The service checks existence and applies brewing rules.',
  items: { type: 'string', minLength: 1 },
  examples: [['dragon-scale', 'ember-root', 'cinder-bloom']],
} as const;

const httpErrorSchema = {
  type: 'object',
  required: ['statusCode', 'error', 'message'],
  properties: {
    statusCode: { type: 'integer' },
    error: { type: 'string' },
    message: { type: 'string' },
    code: { type: 'string' },
  },
} as const;

export const commonResponses = {
  400: {
    ...httpErrorSchema,
    description: 'Invalid request parameters or malformed JSON.',
  },
  500: { ...httpErrorSchema, description: 'Unexpected internal server error.' },
} as const;

export const bodyErrorResponses = {
  413: {
    ...httpErrorSchema,
    description: 'Request body exceeds the server limit (1 MiB by default).',
  },
  415: { ...httpErrorSchema, description: 'Unsupported request content type.' },
} as const;
