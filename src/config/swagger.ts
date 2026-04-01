import swaggerJsdoc from 'swagger-jsdoc';

const buildSwaggerSpec = (baseUrl: string) => {
  const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
      openapi: '3.0.3',
      info: {
        title: 'FYB API',
        version: '1.0.0',
        description: 'API documentation for FYB user management.'
      },
      servers: [
        {
          url: `${baseUrl}/api`,
          description: 'Primary API server'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        schemas: {
          FieldInput: {
            type: 'object',
            required: ['label', 'type'],
            properties: {
              label: { type: 'string', example: 'Full Name' },
              type: { type: 'string', enum: ['TEXT', 'NUMBER', 'IMAGE'], example: 'TEXT' }
            }
          },
          FYBDefinition: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string', example: 'Customer Intake' },
              description: { type: 'string', example: 'Basic customer info' },
              fields: {
                type: 'array',
                items: { $ref: '#/components/schemas/FieldInput' }
              },
              shareLink: { type: 'string', example: 'http://localhost:3000/api/definitions/123/entries' }
            }
          },
          FYBEntryValue: {
            type: 'object',
            required: ['label', 'value'],
            properties: {
              label: { type: 'string', example: 'Age' },
              value: { type: 'string', example: '34', description: 'For images, send a URL or base64 data URI' }
            }
          },
          FYBEntry: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              definitionId: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              slot1: { type: 'string' },
              slot2: { type: 'string' },
              slot3: { type: 'string' },
              slot4: { type: 'string' },
              slot5: { type: 'string' },
              slot6: { type: 'string' },
              slot7: { type: 'string' },
              slot8: { type: 'string' },
              slot9: { type: 'string' },
              slot10: { type: 'string' }
            }
          },
          User: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '6610ab3f1f5e5b001e6d9c9a' },
              name: { type: 'string', example: 'Jane Doe' },
              email: { type: 'string', format: 'email', example: 'jane@fyb.com' },
              role: { type: 'string', enum: ['SUPER_USER', 'USER'], example: 'USER' },
              isInvited: { type: 'boolean', example: false },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          },
          LoginRequest: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string', format: 'password' }
            }
          },
          AuthResponse: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              user: { $ref: '#/components/schemas/User' }
            }
          },

          UserOutput: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Jane Doe' },
              email: { type: 'string', format: 'email', example: 'jane@fyb.com' },
              role: { type: 'string', enum: ['SUPER_USER', 'USER'], example: 'USER' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          },

          InviteRequest: {
            type: 'object',
            required: ['email'],
            properties: {
              email: { type: 'string', format: 'email' }
            }
          },
          RegisterRequest: {
            type: 'object',
            required: ['password', 'name'],
            properties: {
              password: { type: 'string', format: 'password' },
              name: { type: 'string' }
            }
          },
          MessageResponse: {
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          }
        }
      },
      paths: {
        '/users/login': {
          post: {
            tags: ['Auth'],
            summary: 'Authenticate user',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LoginRequest' }
                }
              }
            },
            responses: {
              200: {
                description: 'Login successful',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/AuthResponse' }
                  }
                }
              },
              401: { description: 'Invalid credentials' }
            }
          }
        },
        '/users/register': {
          post: {
            tags: ['Auth'],
            summary: 'Complete invitation and set password',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RegisterRequest' }
                }
              }
            },
            responses: {
              200: {
                description: 'User registered successfully',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/MessageResponse' }
                  }
                }
              },
              400: { description: 'Invalid or expired registration token' }
            }
          }
        },
        '/users': {
          get: {
            tags: ['Users'],
            summary: 'List all users',
            security: [{ bearerAuth: [] }],
            responses: {
              200: {
                description: 'Array of users',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/UserOutput' }
                    }
                  }
                }
              },
              401: { description: 'Unauthorized' }
            }
          }
        },
        '/users/invite': {
          post: {
            tags: ['Users'],
            summary: 'Invite a new user (Super User only)',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/InviteRequest' }
                }
              }
            },
            responses: {
              200: {
                description: 'Invitation sent',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/MessageResponse' }
                  }
                }
              },
              400: { description: 'User already exists' },
              401: { description: 'Unauthorized' },
              403: { description: 'Forbidden - Super User only' }
            }
          }
        },
        '/users/{id}': {
          delete: {
            tags: ['Users'],
            summary: 'Delete a user (Super User only)',
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string' },
                description: 'User id'
              }
            ],
            responses: {
              200: {
                description: 'User deleted successfully',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/MessageResponse' }
                  }
                }
              },
              401: { description: 'Unauthorized' },
              403: { description: 'Forbidden - Super User only' },
              404: { description: 'User not found' }
            }
          }
        },
        '/definitions': {
          post: {
            tags: ['FYB'],
            summary: 'Create a FYB definition (up to 10 fields)',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['name', 'fields'],
                    properties: {
                      name: { type: 'string' },
                      description: { type: 'string' },
                      fields: {
                        type: 'array',
                        maxItems: 10,
                        items: { $ref: '#/components/schemas/FieldInput' }
                      }
                    }
                  }
                }
              }
            },
            responses: {
              201: {
                description: 'Definition created',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/FYBDefinition' }
                  }
                }
              },
              400: { description: 'Validation error' },
              401: { description: 'Unauthorized' }
            }
          },
          get: {
            tags: ['FYB'],
            summary: 'List my FYB definitions',
            security: [{ bearerAuth: [] }],
            responses: {
              200: {
                description: 'Array of definitions',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/FYBDefinition' }
                    }
                  }
                }
              },
              401: { description: 'Unauthorized' }
            }
          }
        },
        '/definitions/{definitionId}/entries': {
          post: {
            tags: ['FYB Entries'],
            summary: 'Submit an entry for a definition (public)',
            parameters: [
              {
                name: 'definitionId',
                in: 'path',
                required: true,
                schema: { type: 'string' }
              }
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['values'],
                    properties: {
                      values: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/FYBEntryValue' }
                      }
                    }
                  }
                }
              }
            },
            responses: {
              201: {
                description: 'Entry created',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/FYBEntry' }
                  }
                }
              },
              400: { description: 'Validation error' },
              404: { description: 'Definition not found' }
            }
          },
          get: {
            tags: ['FYB Entries'],
            summary: 'List entries for a definition (public)',
            parameters: [
              {
                name: 'definitionId',
                in: 'path',
                required: true,
                schema: { type: 'string' }
              }
            ],
            responses: {
              200: {
                description: 'Array of entries',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/FYBEntry' }
                    }
                  }
                }
              },
              404: { description: 'Definition not found' }
            }
          }
        }
      }
    },
    apis: []
  };

  return swaggerJsdoc(swaggerOptions);
};

export default buildSwaggerSpec;
