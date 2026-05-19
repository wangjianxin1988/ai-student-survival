import { defineConfig } from 'tinacms';

// Helper to get environment variables
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

export default defineConfig({
  branch,

  // Use local file system for local development
  // For production, you would use GitHub/GitLab storage
  storage: {
    // For local development, use a local backend
    // For production with Tina Cloud, use the default git-based storage
    tina: {
      // For local development
      contentApiUrl: 'http://localhost:4001/graphql',
    },
  },

  // Define content collections
  collections: [
    // AI Tools Collection
    {
      name: 'tools',
      label: 'AI Tools',
      path: 'content/tools',
      format: 'md',
      fields: [
        {
          type: 'string',
          name: 'name',
          label: 'Name',
          required: true,
        },
        {
          type: 'string',
          name: 'slug',
          label: 'Slug',
          required: true,
        },
        {
          type: 'string',
          name: 'description',
          label: 'Description',
          required: true,
        },
        {
          type: 'string',
          name: 'category',
          label: 'Category',
          required: true,
          options: ['communication', 'coding', 'design', 'research', 'writing'],
        },
        {
          type: 'string',
          name: 'subcategory',
          label: 'Subcategory',
        },
        {
          type: 'string',
          name: 'pricing',
          label: 'Pricing',
          required: true,
          options: ['free', 'freemium', 'paid'],
        },
        {
          type: 'object',
          name: 'priceDetail',
          label: 'Price Detail',
          fields: [
            { type: 'number', name: 'monthly', label: 'Monthly Price' },
            { type: 'number', name: 'yearly', label: 'Yearly Price' },
            { type: 'string', name: 'currency', label: 'Currency' },
          ],
        },
        {
          type: 'string',
          name: 'url',
          label: 'Website URL',
        },
        {
          type: 'string',
          name: 'imageUrl',
          label: 'Image URL',
        },
        {
          type: 'number',
          name: 'rating',
          label: 'Rating',
        },
        {
          type: 'number',
          name: 'ratingCount',
          label: 'Rating Count',
        },
        {
          type: 'object',
          name: 'dimensions',
          label: 'Dimensions',
          fields: [
            { type: 'number', name: 'easeOfUse', label: 'Ease of Use' },
            { type: 'number', name: 'features', label: 'Features' },
            { type: 'number', name: 'value', label: 'Value' },
          ],
        },
        {
          type: 'list',
          name: 'tags',
          label: 'Tags',
          type: 'string',
        },
        {
          type: 'list',
          name: 'features',
          label: 'Features',
          type: 'string',
        },
        {
          type: 'list',
          name: 'alternatives',
          label: 'Alternatives',
          type: 'string',
        },
        {
          type: 'boolean',
          name: 'isNew',
          label: 'Is New',
        },
        {
          type: 'string',
          name: 'createdAt',
          label: 'Created At',
        },
        {
          type: 'string',
          name: 'updatedAt',
          label: 'Updated At',
        },
      ],
    },

    // Payment Solutions Collection
    {
      name: 'payment_solutions',
      label: 'Payment Solutions',
      path: 'content/payment',
      format: 'md',
      fields: [
        {
          type: 'string',
          name: 'name',
          label: 'Name',
          required: true,
        },
        {
          type: 'string',
          name: 'slug',
          label: 'Slug',
          required: true,
        },
        {
          type: 'string',
          name: 'description',
          label: 'Description',
          required: true,
        },
        {
          type: 'string',
          name: 'category',
          label: 'Category',
          options: ['card', 'ewallet', 'banking', 'crypto'],
        },
        {
          type: 'object',
          name: 'fees',
          label: 'Fees',
          fields: [
            { type: 'string', name: 'deposit', label: 'Deposit Fee' },
            { type: 'string', name: 'withdrawal', label: 'Withdrawal Fee' },
            { type: 'string', name: 'transaction', label: 'Transaction Fee' },
          ],
        },
        {
          type: 'string',
          name: 'url',
          label: 'Website URL',
        },
        {
          type: 'string',
          name: 'imageUrl',
          label: 'Image URL',
        },
        {
          type: 'list',
          name: 'pros',
          label: 'Pros',
          type: 'string',
        },
        {
          type: 'list',
          name: 'cons',
          label: 'Cons',
          type: 'string',
        },
        {
          type: 'string',
          name: 'createdAt',
          label: 'Created At',
        },
        {
          type: 'string',
          name: 'updatedAt',
          label: 'Updated At',
        },
      ],
    },

    // University Policies Collection
    {
      name: 'university_policies',
      label: 'University Policies',
      path: 'content/policies',
      format: 'md',
      fields: [
        {
          type: 'string',
          name: 'title',
          label: 'Title',
          required: true,
        },
        {
          type: 'string',
          name: 'id',
          label: 'Policy ID',
          required: true,
        },
        {
          type: 'string',
          name: 'description',
          label: 'Description',
          required: true,
        },
        {
          type: 'string',
          name: 'category',
          label: 'Category',
          options: ['academic', 'visa', 'financial', 'housing', 'health'],
        },
        {
          type: 'rich-text',
          name: 'content',
          label: 'Content',
        },
        {
          type: 'string',
          name: 'createdAt',
          label: 'Created At',
        },
        {
          type: 'string',
          name: 'updatedAt',
          label: 'Updated At',
        },
      ],
    },

    // Prompt Templates Collection
    {
      name: 'prompt_templates',
      label: 'Prompt Templates',
      path: 'content/prompts',
      format: 'md',
      fields: [
        {
          type: 'string',
          name: 'title',
          label: 'Title',
          required: true,
        },
        {
          type: 'string',
          name: 'slug',
          label: 'Slug',
          required: true,
        },
        {
          type: 'string',
          name: 'description',
          label: 'Description',
          required: true,
        },
        {
          type: 'string',
          name: 'category',
          label: 'Category',
          options: ['writing', 'coding', 'research', 'learning', 'communication'],
        },
        {
          type: 'string',
          name: 'prompt',
          label: 'Prompt Template',
          required: true,
        },
        {
          type: 'list',
          name: 'variables',
          label: 'Variables',
          type: 'string',
        },
        {
          type: 'list',
          name: 'examples',
          label: 'Examples',
          type: 'string',
        },
        {
          type: 'string',
          name: 'createdAt',
          label: 'Created At',
        },
        {
          type: 'string',
          name: 'updatedAt',
          label: 'Updated At',
        },
      ],
    },
  ],

  // Define media store (optional - for handling uploads)
  media: {
    tina: {
      // Public URL where media files are stored
      publicFolder: 'public',
      mediaRoot: 'uploads',
    },
  },
});
