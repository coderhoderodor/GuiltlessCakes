/**
 * OpenAPI Specification for Guiltless Cakes API
 */

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Guiltless Cakes API',
    version: '1.0.0',
    description: 'API for the Guiltless Cakes boutique bakery platform',
    contact: {
      name: 'Guiltless Cakes',
      email: 'hello@guiltlesscakes.com',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API Server',
    },
  ],
  tags: [
    { name: 'Menu', description: 'Menu and menu items endpoints' },
    { name: 'Orders', description: 'Order management endpoints' },
    { name: 'Checkout', description: 'Checkout and payment endpoints' },
    { name: 'Admin', description: 'Admin-only endpoints' },
    { name: 'Inquiries', description: 'Custom cake inquiry endpoints' },
  ],
  paths: {
    '/menu': {
      get: {
        tags: ['Menu'],
        summary: 'Get weekly menu',
        description: 'Returns the menu items available for the upcoming week',
        parameters: [
          {
            name: 'date',
            in: 'query',
            description: 'Specific date to get menu for (YYYY-MM-DD)',
            schema: { type: 'string', format: 'date' },
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/MenuItem' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/checkout': {
      post: {
        tags: ['Checkout'],
        summary: 'Create checkout session',
        description: 'Creates a Stripe checkout session for the cart items',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CheckoutRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Checkout session created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string', description: 'Stripe checkout URL' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          429: { $ref: '#/components/responses/RateLimited' },
        },
      },
    },
    '/orders/confirm': {
      get: {
        tags: ['Orders'],
        summary: 'Confirm order',
        description: 'Confirms an order after successful payment',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'session_id',
            in: 'query',
            required: true,
            description: 'Stripe checkout session ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Order confirmed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/OrderConfirmation' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/orders': {
      get: {
        tags: ['Admin'],
        summary: 'List all orders',
        description: 'Returns all orders with optional filtering',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'date',
            in: 'query',
            description: 'Filter by pickup date',
            schema: { type: 'string', format: 'date' },
          },
          {
            name: 'status',
            in: 'query',
            description: 'Filter by order status',
            schema: { $ref: '#/components/schemas/OrderStatus' },
          },
        ],
        responses: {
          200: {
            description: 'List of orders',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Order' },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/orders/{id}': {
      get: {
        tags: ['Admin'],
        summary: 'Get order by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Order details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { data: { $ref: '#/components/schemas/Order' } },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Admin'],
        summary: 'Update order',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateOrder' },
            },
          },
        },
        responses: {
          200: { description: 'Order updated' },
          400: { $ref: '#/components/responses/ValidationError' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Admin'],
        summary: 'Delete order',
        description: 'Only canceled orders can be deleted',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: { description: 'Order deleted' },
          400: { $ref: '#/components/responses/ValidationError' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/admin/menu-items': {
      get: {
        tags: ['Admin'],
        summary: 'List all menu items',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of menu items',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/MenuItem' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Admin'],
        summary: 'Create menu item',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMenuItem' },
            },
          },
        },
        responses: {
          201: { description: 'Menu item created' },
          400: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Supabase JWT token',
      },
    },
    schemas: {
      MenuItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          slug: { type: 'string' },
          base_price: { type: 'number' },
          image_url: { type: 'string', nullable: true },
          dietary_tags: { type: 'array', items: { type: 'string' } },
          category: { type: 'string', nullable: true },
          active: { type: 'boolean' },
          translations: {
            type: 'array',
            items: { $ref: '#/components/schemas/MenuItemTranslation' },
          },
        },
      },
      MenuItemTranslation: {
        type: 'object',
        properties: {
          language: { type: 'string', enum: ['en', 'es', 'pt'] },
          name: { type: 'string' },
          description: { type: 'string' },
          weekly_story_snippet: { type: 'string', nullable: true },
        },
      },
      CreateMenuItem: {
        type: 'object',
        required: ['slug', 'base_price', 'translations'],
        properties: {
          slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
          base_price: { type: 'number', minimum: 0 },
          image_url: { type: 'string', nullable: true },
          dietary_tags: { type: 'array', items: { type: 'string' } },
          category: { type: 'string', nullable: true },
          active: { type: 'boolean', default: true },
          translations: {
            type: 'array',
            minItems: 1,
            items: { $ref: '#/components/schemas/MenuItemTranslation' },
          },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          pickup_date: { type: 'string', format: 'date' },
          status: { $ref: '#/components/schemas/OrderStatus' },
          subtotal_amount: { type: 'number' },
          service_fee_amount: { type: 'number' },
          tax_amount: { type: 'number' },
          total_amount: { type: 'number' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      OrderStatus: {
        type: 'string',
        enum: ['paid', 'prepping', 'ready', 'picked_up', 'canceled'],
      },
      UpdateOrder: {
        type: 'object',
        properties: {
          status: { $ref: '#/components/schemas/OrderStatus' },
          notes: { type: 'string', nullable: true },
        },
      },
      CheckoutRequest: {
        type: 'object',
        required: ['items', 'pickupDate', 'pickupWindowId'],
        properties: {
          items: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['menuItemId', 'quantity', 'name'],
              properties: {
                menuItemId: { type: 'string', format: 'uuid' },
                quantity: { type: 'integer', minimum: 1, maximum: 10 },
                name: { type: 'string' },
              },
            },
          },
          pickupDate: { type: 'string', format: 'date' },
          pickupWindowId: { type: 'string', format: 'uuid' },
        },
      },
      OrderConfirmation: {
        type: 'object',
        properties: {
          orderNumber: { type: 'string' },
          pickupDate: { type: 'string' },
          pickupWindow: { type: 'string' },
          total: { type: 'number' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                quantity: { type: 'integer' },
                price: { type: 'number' },
              },
            },
          },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'object' },
            },
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
          },
        },
      },
      Forbidden: {
        description: 'Access denied',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
          },
        },
      },
      ValidationError: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
          },
        },
      },
      RateLimited: {
        description: 'Too many requests',
        headers: {
          'X-RateLimit-Limit': {
            schema: { type: 'integer' },
            description: 'Rate limit ceiling',
          },
          'X-RateLimit-Remaining': {
            schema: { type: 'integer' },
            description: 'Remaining requests',
          },
          'Retry-After': {
            schema: { type: 'integer' },
            description: 'Seconds until retry',
          },
        },
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiError' },
          },
        },
      },
    },
  },
};
